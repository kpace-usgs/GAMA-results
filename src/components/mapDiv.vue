<template>
	<div id='mapDiv'>
		<PulseLoader :loading='isLoading'></PulseLoader>
	</div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import Loader from '../mixins/loader.vue'
import wellFilter from '../mixins/wellFilter.js'
import wellIcons from '../mixins/wellIcons.js'
import wellMarkers from '../mixins/wellMarkers.js'
import provinceStyle from '../mixins/provinceStyle.js'
import paneStyle from '../mixins/paneStyle.js'
import * as d3 from 'd3-request';

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
	mixins: [Loader, 'wellFilter', 'wellMarkers', 'wellIcons', 'provinceStyle', 'paneStyle'],
	props: ['param', 'type', 'layerArr'],
	watch: {
		type(){
			this.clearLayer(this.pointLayer);
			console.log(this.pointLayer.getLayers());
			if(this.param == ''){
				//load data according to type and change this.wells
				this.importTypeJson();
			} else{
				this.toggleLoading();
				// change which of this.wells are shown
				this.addWells(wellMarkers, wellFilter);
			}
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
		},

		param(){
			if(this.param != ''){
				this.importParamJson(); //import parameter's json when param changes
			} else {
				this.importTypeJson();
			}
		}
	},
	computed: {
		studyType(){
			// used to filter wells returned from parameter value
			switch(this.type){
				case 'SHALLOW': 
					return 'Domestic-supply' 
					//have to change value because geojson property is recorded as 'domestic-supply' instead of 'shallow'
					break;
				case 'DEEP':
					return 'Public-supply'
					break;
				default:
					return this.type;
			}
		}
	},
	methods: {
		importTypeJson(){
			this.toggleLoading();
			var that = this;
			var callback = this.addWells;;
			// if any other type than status is selected, only import one json file
			if(this.type !== 'STATUS'){
				var string = this.type.toLowerCase();
				var url = './static/geojsons/'+ string + '.json';
				d3.json(url, function(err, result){
					if(err) throw err;
					that.wells = result;
					return callback(wellIcons, function(){return true}); //add results to map with no filtering 2nd callback function
				})
			} else{
				// if status is selected, then import all json files 
				d3.json('./static/geojsons/deep.json', function(err, deep){
					that.wells = deep;
					callback();
					d3.json('./static/geojsons/shallow.json', function(err, shallow){
						if(err) throw err;
						that.wells = shallow;
						callback();
						d3.json('./static/geojsons/trends.json', function(err, trends){
							that.wells = trends;
							callback(wellIcons, function(){return true});
						})
					})
				});
			}
		},

		importParamJson(){
			var that = this;
			var url = './static/geojsons/'+this.param.value+'.json';
			this.toggleLoading();
			this.clearLayer(this.pointLayer);

			d3.json(url, function(err, result){
				if(err) throw err;
				that.wells = result;
				that.addWells(wellMarkers, wellFilter);
			});
		},

		importPaneJson(string){
			this.toggleLoading();
			var url = './static/geojsons/' + string + '.json';
			var that = this;

			d3.json(url, function(err, result){
				if(err) throw err;
				var geoJson = L.geoJSON(result, {
					style: feature => {
						return paneStyle(feature);
					}
				});

				that.polygonLayer.addLayer(geoJson); //add to map
				that.polygons[string] = geoJson; // save to state

				that.toggleLoading();
			});
		},

		clearLayer(layer){
			// clear layer if it has any content
			if(layer.getLayers().length > 0){
				layer.clearLayers();
			}
		},

		addWells(callback1, callback2){
			// this is a separate function since we sometimes want to change the pointLayer without having imported new data
			// by contrast, polygons loaded by importPaneJson() are added to a layer then and there.

			var that = this;
			var param = this.param;
			var studyType = this.studyType;
	
			// add geojson to pointLayer and call correct function for pointToLayer
			this.pointLayer.addLayer(
				L.geoJSON(that.wells, {
						pointToLayer: (feature, latlng) => {
							return callback1(feature, latlng, param, studyType);
						},

						filter: (feature) => {
							return callback2(feature, studyType)
						}
					}
				)
			);

			this.toggleLoading();
		},

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