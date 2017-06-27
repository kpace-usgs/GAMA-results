<template>
	<div id='mapDiv'>
		<PulseLoader :loading='isLoading'></PulseLoader>
	</div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import Loader from '../mixins/loader.vue'
import getParamString from '../mixins/getParamString.js'
import getType from '../mixins/getType.js'
// import wellFilter from '../mixins/wellFilter.js'
// import wellIcons from '../mixins/wellIcons.js'
// import wellMarkers from '../mixins/wellMarkers.js'
// import provinceStyle from '../mixins/provinceStyle.js'
// import paneStyle from '../mixins/paneStyle.js'
import * as d3 from 'd3-request';
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {
	name: 'MapDiv',
	data() {
		return {
			map: '',
			baseLayers: '',
			view: [37.7, -120.57],
			zoom: 6,
			polygonLayer: L.featureGroup(),
			polygons: {},
			pointLayer: L.featureGroup(),
			wells: ''
		}
	},
	mixins: [Loader],
	props: ['param', 'type', 'layerArr'],
	watch: {
		type(){
			this.importWells();
		},
		param(){
			this.importWells();
		},
		layerArr(){
			//clear L.featureGroup when user changes menu selection
			this.clearLayer(this.polygonLayer);

			// get each selected pane layer
			for(var i = 0; i < this.layerArr.length; i++){
				var layerName = this.layerArr[i];
				// if not already saved in this.polygons, import
				if(!this.polygons.hasOwnProperty(layerName)){
					this.importPaneJson(layerName);
				} else {
					this.polygonLayer.addLayer(this.polygons[layerName]);
				}
			}
		}
	},
	computed: {
		studyType(){
			// used to filter wells returned from parameter value
			switch(this.type){
				case '2': 
					return 'Domestic-supply' 
					//have to change value because geojson property is recorded as 'domestic-supply' instead of 'shallow'
					break;
				case '3':
					return 'Public-supply'
					break;
				default:
					return this.type;
			}
		}
	},
	methods: {
		importWells(){
			this.clearLayer(this.pointLayer);
			if(this.param != ''){
				this.importParamJson(); //import parameter's json when param changes
			} else {
				this.importTypeJson();
			}
		},

		importTypeJson(){
			this.toggleLoading();
			var that = this;
			var url = 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/sites/MapServer/' + this.type;
			console.log(url);

			this.pointLayer.addLayer(esri.featureLayer({
				url: url,
				onEachFeature: (feature, layer) => {
					var popupText = getType(feature);
					return layer.bindPopup(() => {
						return L.Util.template(popupText)
					})
				}
			}));
			this.toggleLoading();
		},

		importParamJson(){
			var url = 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/TestLayers/MapServer/' + this.param.value;
			var type = this.studyType;
			var paramString = getParamString(this.param.value);

			this.pointLayer.addLayer(esri.featureLayer({
				url: url,
				onEachFeature: function(feature, layer){
					return layer.bindPopup(() => {
						return L.Util.template(paramString, feature.properties);
					})
				}
			}));
		},

		importPaneJson(val){
			this.toggleLoading();

			if(val == 2 || val == 4){
				// use this for all values when arcServer has all data
				var url = 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/base_layers/MapServer/' + val;

				var layer = esri.featureLayer({
					url: url,
					onEachFeature: (feature, layer) => {
						return layer.bindPopup(() => {
							return L.Util.template('{PROVINCE}', feature.properties)
						})
					}
				});
				this.polygonLayer.addLayer(layer); // add to map
				this.polygons.val = layer; //save to state
				this.toggleLoading();
			}
			else {
				var that = this;
				var url = './static/geojsons/pane' + val + '.json';
				d3.json(url, function(err, result){
					if(err) throw err;
					var geoJson = L.geoJSON(result, {
						style: feature => {
							return {
								color: 'black',
								weight: 0.5,
								opacity: 0.8
							}
						}
					});

					that.polygonLayer.addLayer(geoJson); //add to map
					that.polygons[string] = geoJson; // save to state
					that.toggleLoading();
				});
			}
						
		},

		clearLayer(layer){
			// clear layer if it has any content
			if(layer.getLayers().length > 0){
				layer.clearLayers();
			}
		},

		// addWells(callback1, callback2){
		// 	// this is a separate function since we sometimes want to change the pointLayer without having imported new data
		// 	// by contrast, polygons loaded by importPaneJson() are added to a layer then and there.

		// 	var that = this;
		// 	var param = this.param;
		// 	var studyType = this.studyType;
	
		// 	// add geojson to pointLayer and call correct function for pointToLayer
		// 	this.pointLayer.addLayer(
		// 		L.geoJSON(that.wells, {
		// 				pointToLayer: (feature, latlng) => {
		// 					return callback1(feature, latlng, param, studyType);
		// 				},

		// 				filter: (feature) => {
		// 					return callback2(feature, studyType)
		// 				}
		// 			}
		// 		)
		// 	);

		// 	this.toggleLoading();
		// },

		loadOverlays(){
			this.baseLayers = {
				"Topography": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', 
					{ attribution:  'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
					}
				),
				"Terrain" : L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.{ext}', 
					{attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					subdomain: 'abcd', 
					ext: 'png'
					}
				)
			};

			// set landscape layer as default
			this.baseLayers['Topography'].addTo(this.map);

			L.control.layers(this.baseLayers, {}, {collapsed: false}).setPosition('topleft').addTo(this.map);

			this.toggleLoading(); //turn off loader spinner
		}
	},

	mounted() {
		this.map = L.map('mapDiv').setView(this.view, this.zoom); 
		this.loadOverlays();
		this.polygonLayer.setZIndex(-10);
		this.polygonLayer.addTo(this.map);
		this.pointLayer.addTo(this.map);
	}
}
</script>


<style> 
#mapDiv{
	height: 100%;
	min-height: 100vh;
	width: 100%;
}
.v-spinner{
    position: absolute;
    top: 50px;
    left: 50%;
    right: 50%;
    z-index: 1010;
}
</style>