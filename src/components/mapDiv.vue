<template>
	<div id='mapDiv'>
		<PulseLoader :loading='isLoading'></PulseLoader>
	</div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import Loader from '../mixins/loader.vue'
import ParamData from '../mixins/getParamData.vue'
import getType from '../mixins/getType.js'
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
			maxZoom: 8,
			polygonGroup: L.featureGroup(),
			polygons: {},
			pointGroup: L.featureGroup(),
			typeLayer: '',
			constituentLayer: '',
			wells: [],

		}
	},
	mixins: [Loader, ParamData],
	props: ['param', 'type', 'layerArr'],
	watch: {
		type(){
			this.toggleLoading();
		
			// if a constituent has already been selected, this.constituentLayer will already be populated
			if(typeof(this.param.value) == 'number') {
				this.filterConstituentLayer();

			} else {
				this.pointGroup.clearLayers();
				this.importTypeJson();
			}
			
		},

		param(){
			console.log('param changed');
			this.toggleLoading();
	
			this.importParamGeometry(this.param.value);
			this.addConstituentLayer(); // add to this.pointGroup if not there already
			

			// if the groundwater study type is also selected, run a query() on the param layer
			if(this.type != ''){
				this.pointGroup.removeLayer(this.typeLayer); // remove any typeLayer existing on the map
				return this.filterConstituentLayer();
			} 
			
		},

		layerArr(){
			//clear L.featureGroup when user changes menu selection
			this.clearLayer(this.polygonGroup);

			// get each selected pane layer
			for(var i = 0; i < this.layerArr.length; i++){
				var layerName = this.layerArr[i];
				// if not already saved in this.polygons, import
				if(!this.polygons.hasOwnProperty(layerName)){
					this.importPaneJson(layerName);
				} else {
					this.polygonGroup.addLayer(this.polygons[layerName]);
				}
			}
		}
	},
	computed: {
		studyType(){
			// used to filter wells returned from parameter value
			switch(this.type){
				case '0':
					return 'STATUS'
					break;
				case '1':
					return 'TRENDS'
					break;
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

		importTypeJson(){
			var url = 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/sites/MapServer/' + this.type;

			this.typeLayer = esri.featureLayer({
				url: url,
				onEachFeature: (feature, layer) => {
					var popupText = getType(feature);
					return layer.bindPopup(() => {
						return L.Util.template(popupText)
					})
				}
			});

			this.typeLayer.on('load', e => {
				this.toggleLoading();
			});
			this.pointGroup.addLayer(this.typeLayer);
		},

		importPaneJson(val){
			this.toggleLoading();
			console.log('import pane');
			var simplifyFactor = 0.8;
			console.log(simplifyFactor);
			//url changes depending on layer
			var url = val == 2 ? 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/base_layers/MapServer/2' : 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/baselayers_fix/MapServer/' + val;
			var that = this;

			var layer = esri.featureLayer({
				url: url,
				precision: 2, // how many digits of precision to request from the server
				simplifyFactor: simplifyFactor, // how much to simplify polygons
				onEachFeature: (feature, layer) => {
					return layer.bindPopup(() => {
						return L.Util.template('{PROVINCE}', feature.properties)
					})
				}
			});

			layer.on('load', function(e) {
				console.log('layer loading');
				that.toggleLoading();
			})
			
			this.polygonGroup.addLayer(layer); // add to map
			this.polygons.val = layer; //save to state					
		},

		clearLayer(layer){
			// clear layer if it has any content
			if(layer.getLayers().length > 0){
				layer.clearLayers();
			}
		},

		addConstituentLayer(){
			// if constituent layer of markers not already added to map, add it now
			if(!this.pointGroup.hasLayer(this.constituentLayer)){
				console.log('add layer');
				this.pointGroup.addLayer(this.constituentLayer);

				// also set condition to toggle loader when done loading
				this.constituentLayer.on('load', e => {
					console.log('layer loading');
					this.toggleLoading();
				});
			}
		},

		filterConstituentLayer(){
			console.log('filter constituent layer');
			console.log(this.studyType);
			console.log(this.type);

			if(this.type != 0 && this.type != 1){
				this.filterByType(this.studyType);
			} else {
				console.log('filter by status')
				this.filterByStatus(this.studyType);
			}
			
			this.constituentLayer.redraw();
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
		this.map = L.map('mapDiv').setView(this.view, this.zoom).setMaxZoom(this.maxZoom);

		L.control.scale({position: 'bottomright'}).addTo(this.map); 
		this.loadOverlays();
		this.polygonGroup.setZIndex(-10);
		this.polygonGroup.addTo(this.map);
		this.pointGroup.addTo(this.map);

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