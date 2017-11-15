<template>
	<div id='mapDiv'></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import GetData from '../mixins/getData.vue' //functions that talk to arcserver
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
			minZoom: 6,
			maxZoom: 12,
			polygonGroup: L.featureGroup(),
			polygons: {},
			pointGroup: L.featureGroup({
				pane: 'markerPane'
			}),
			typeLayer: '',
			constituentLayer: ''
		}
	},
	mixins: [GetData],
	props: ['param', 'type', 'trend', 'layerArr', 'reset', 'trendIndex', 'thresh'],

	computed: {
		isATrends(){
			/* if groundwater study type is one of the trends and the selected param has a trends array, return true */
			return (this.type === "0" || this.type === "4") && this.param.hasOwnProperty('trends') ? true : false;
		}
	},

	// watch for changes made on the menu component
	watch: { 

		type(){	
			this.map.closePopup(); // close any popups
			this.pointGroup.clearLayers();

			if(typeof(this.param.value) == 'number') { // if a constituent has been selected
				if(this.isATrends){ // if trends layers exist and a trends option has been selected 
					if(this.trend !== ""){
						// if trend value already exists, filter existing constituentlayer by new type. if the trend value doesn't change, the map won't call this.importTrend().
						this.constituentLayer.setLayerDefs(this.decideHowToFilter(this.type, this.trend));
					} else {
						return;
					}// else do nothing; the trend value will be updated to the first value in the parameter's trends array, and this.importTrend will be called next.
				} else{
					// if a trend value exists then need to change from trends layer to param layer
					if(this.trend !== ""){
						console.log('import new param layer');
						console.log(this.param.value);
						this.constituentLayer = this.importParam(this.type, this.param.value); // load new layer
					} else {
						this.constituentLayer.setLayerDefs(this.decideHowToFilter(this.type, this.param.value)); // just update existing param layer
					}
					
				}
				this.addConstituentLayer();
			} 

			// if no constituent has been selected, then show the well locations by type
			else {
				this.wellsByType();
			}
		},

		trend(){
			this.pointGroup.clearLayers();
			
			if(this.trend === ""){
				console.log('map sees trend has been changed to blank')
				// trend is being reset
				this.map.closePopup(); // do I really need this? wouldn't changing the param or type that resets the trend to "" already have called this?
			} else{
				console.log("map sees trend has been changed to a value")
				// the trend value has been changed to an integer, get trend layer
				this.constituentLayer = this.importTrend(this.type, this.trend);
				this.addConstituentLayer();
			}
		},

		param(){
			this.map.closePopup();
			this.pointGroup.clearLayers();
			/* if selection box has a value, save this.constituentLayer */
			if(this.param.value !== ""){

				/* only import param if the parameter is not trends (either this.type isn't trends, or the parameter value doesn't have a trends array) */
				if(this.isATrends){
					console.log('dont import param')
					// do nothing, wait for the new this.trends value to control things
				} else {
					console.log('import param')
					this.constituentLayer = this.importParam(this.type, this.param.value);
					this.addConstituentLayer();
				}
			}

			/* if param value is being cleared, revert back to showing wells by type */
			else {
				this.wellsByType();
			}
			// else if this.param.value is an empty string, the pointGroup will already be cleared
		},

		layerArr(){
			//clear L.featureGroup when user changes menu selection
			this.polygonGroup.clearLayers();

			// get each selected pane layer
			for(var i = 0; i < this.layerArr.length; i++){
				var layerName = this.layerArr[i];
				var layer = this.importPaneJson(layerName);
				this.polygonGroup.addLayer(layer);
			}
		},

		reset(){
			this.checkReset();
		}
	},
	
	methods: {

		wellsByType(){
			this.pointGroup.clearLayers();
			/* if there's a value in the study type menu, load those wells */
			if(this.type !== ""){
				// load the wells by type and add to the map
				console.log('load wells by type')
				// if trend sites, domestic supply, public supply is chosen, just get that layer
				if(this.type != 3){
					this.pointGroup.addLayer(this.importTypeJson(this.type));
				}
				else {
					// load all 3 type layers. order is important
					this.pointGroup.addLayer(this.importTypeJson(1)).bringToFront();
					this.pointGroup.addLayer(this.importTypeJson(0)).bringToBack();
					this.pointGroup.addLayer(this.importTypeJson(2)).bringToBack();
				}
			}
		},

		addConstituentLayer(){
			// if constituent layer of markers not already added to map, add it now
			
			if(!this.pointGroup.hasLayer(this.constituentLayer)){
				console.log('add layer')
				this.pointGroup.addLayer(this.constituentLayer);
				this.constituentLayer.redraw();
			} else {
				this.constituentLayer.redraw();
			}
		},

		checkReset(){
			console.log('reset');
			this.pointGroup.clearLayers();
			this.polygonGroup.clearLayers();
			// recenter map to home position
			this.map.setView(this.view, this.zoom);
		},

		loadOverlays(){
			this.baseLayers = {
				"Topography": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', 
					{ attribution:  'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
					}
				),
				"Grayscale": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
					{ attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ' }
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

			this.$emit('toggleLoading', false); //turn off loader spinner
		}
	},

	mounted() {
		this.map = L.map('mapDiv').setView(this.view, this.zoom).setMaxZoom(this.maxZoom).setMinZoom(this.minZoom);

		L.control.scale({position: 'bottomright'}).addTo(this.map); 
		this.loadOverlays();

		this.polygonGroup.addTo(this.map);
		this.pointGroup.addTo(this.map).setZIndex(100);
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