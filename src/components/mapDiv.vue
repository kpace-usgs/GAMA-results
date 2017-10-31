<template>
	<div id='mapDiv'></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

import ParamData from '../mixins/getParamData.vue'
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
	mixins: [ParamData],
	props: ['param', 'type', 'trend', 'layerArr', 'reset'],

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

			// don't necessarily clear layers from pointgroup. if the constituent layer is just being filtered, just redraw it.

			// if the type layer is being changed on the constituent layer, filter the constituent layer that already exists
			if(typeof(this.param.value) == 'number') {
				if(this.isATrends){
					// do nothing
					console.log('dont filter by type')
				} else{
					console.log('filter by type');
					this.constituentLayer.setLayerDefs(this.decideHowToFilter(this.type, this.param.value)); 

					this.addConstituentLayer();
				}
			} 

			// otherwise the map is showing the wells by type, with no constituent data
			else {
				this.wellsByType();
			}
		},

		trend(){
			this.pointGroup.clearLayers();
			if(this.trend !== ""){
				this.constituentLayer = this.importTrend();
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
					this.constituentLayer = this.importParam();
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
				// if not already saved in this.polygons, import
				if(!this.polygons.hasOwnProperty(layerName)){
					var layer = this.importPaneJson(layerName);
					this.polygonGroup.addLayer(layer);
				} else {
					this.polygonGroup.addLayer(this.polygons[layerName]);
				}
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
					this.pointGroup.addLayer(this.importTypeJson(2)).bringToBack();
					this.pointGroup.addLayer(this.importTypeJson(1));
					this.pointGroup.addLayer(this.importTypeJson(0)).bringToFront();
				}
			}
		},

		addConstituentLayer(){
			// if constituent layer of markers not already added to map, add it now
			
			if(!this.pointGroup.hasLayer(this.constituentLayer)){
				console.log('add layer')
				this.pointGroup.addLayer(this.constituentLayer);
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