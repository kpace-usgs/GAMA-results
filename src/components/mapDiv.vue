<template>
	<div id='mapDiv'></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import GetData from '../mixins/getData.vue' //functions that talk to arcserver
import Popup from '../mixins/Popup.vue';
import listeners from '../mixins/addEventListeners.vue'
import pointStyle from '../mixins/pointStyle.js'

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
			constituentLayer: '',
			trendVisits: 0,
			fc: ''
		}
	},
	mixins: [GetData, Popup, listeners ],
	props: ['param', 'type', 'trend', 'layerArr', 'reset', 'trendIndex'],

	computed: {
		isATrends(){
			/* if groundwater study type is one of the trends, return true */
			return (this.type === "0" || this.type === "4") ? true : false;
		}
	},

	// watch for changes made on the menu component
	watch: { 

		type(){	
			this.map.closePopup(); // close any popups
			this.pointGroup.clearLayers();

			if(this.param.PCODE != '') { // if a constituent has been selected
	
				if(this.isATrends){ // if a trends type has been selected 
					var callback = this.buildTrendLayer;
					this.buildData(this.type, this.param.PCODE, callback);
				} 

				else{
					// if a trend value exists then need to change from trends layer to param layer
					//var callback = this.buildStatusLayer;
					this.buildStatusLayer(this.fc);
				}

				// // get data for layer, call callback when data returned
				// this.buildData(this.type, this.param.PCODE, callback);
			} 

			// if no constituent has been selected, then show the well locations by type
			else {
				this.wellsByType();
			}
		},

		trendIndex(){
		
			if(this.trendIndex == "" || !this.trendIndex){
				console.log('map sees trend has been changed to blank')
				// trend is being reset by type changing
			} else{
				this.pointGroup.clearLayers();
				console.log("map sees trend has been changed to a value")

				// the trend value has been changed to an integer, get trend layer
				this.buildData(this.type, this.param.PCODE, this.buildTrendLayer);
			}
		},

		param(){
			this.map.closePopup();
			this.pointGroup.clearLayers();
			/* if selection box has a value, save this.constituentLayer */
			if(this.param.PCODE !== ""){

				/* only import param if type is not a trend type */
				if(this.isATrends){
					console.log('import trend');
					var callback = this.buildTrendLayer;
				} else {
					console.log('import status');
					var callback = this.buildStatusLayer;
				}

				this.buildData(this.type, this.param.PCODE, callback);
			}

			/* if param value is being cleared, revert back to showing wells by type */
			else { // else if this.param.PCODE is an empty string, the pointGroup will already be cleared
				this.wellsByType();
			}
			
		},

		layerArr(){
			//clear L.featureGroup when user changes menu selection
			this.polygonGroup.clearLayers();

			// get each selected pane layer
			for(var i = 0; i < this.layerArr.length; i++){
				var layerName = this.layerArr[i];
				var layer = this.buildPolygonLayer(layerName);
				this.addEventListeners(layer);
				this.polygonGroup.addLayer(layer);
			}
		},

		reset(){
			this.checkReset();
		}
	},
	
	methods: {

		buildTrendLayerfc() {

			var popup = this.returnTrendPopup;
			console.log(fc); 
			var index = this.trendIndex + 1;
			var param = this.param;

			var layer = L.geoJSON(fc, {
				pointToLayer: (feature, latlng) => {
					return pointStyle(feature,latlng, param);
				},
				onEachFeature: (feature, layer) => {
					return layer.bindPopup(popup(feature.properties, fc));
				},
				filter: ( feature ) => {
					return feature.properties.SU_VisitNo == index;
					// filter by this.trendIndex
				}
			});

			this.addEventListeners(layer);

			// filter by trendIndex
			this.constituentLayer = layer;
			this.addPoints(this.constituentLayer);

			this.countTrendVisits(fc); // count how many trend visits
		},

		buildStatusLayer(fc) {

			var popup = this.returnParamPopup;
			var param = this.param;
			var typeString = this.typeString;
			console.log(typeString)

			var layer = L.geoJSON(fc, {
				pointToLayer: (feature, latlng) => {
					return pointStyle(feature, latlng, param)
				},
				onEachFeature: (feature, layer) => {
					return layer.bindPopup( () => popup(feature.properties)
					); // must return the popup content each time or else all popups will just be the same, equal to the last feature to load
				},
				filter: feature => {

					return this.type == "" || this.type == 3 ? feature.properties.SU_VisitNo == '1' : feature.properties.SU_VisitNo == '1' && feature.properties.StudyType == typeString;
				}
			});

			this.addEventListeners(layer);
			this.constituentLayer = layer;
			this.addPoints(this.constituentLayer);
		},

		wellsByType(){
			this.pointGroup.clearLayers();
			/* if there's a value in the study type menu, load those wells */
			if(this.type !== ""){
				// load the wells by type and add to the map
				console.log('load wells by type')
	
				// if trend sites, domestic supply, public supply is chosen, just get that layer
				if(this.type != 3){
					var layer = this.buildLayer(this.type);
					this.addLayer(layer);
				}
				else {
					// load all 3 type layers. order is important
					this.addLayer(this.buildLayer(1));
					this.addLayer(this.buildLayer(0));
					this.addLayer(this.buildLayer(2));
				}
			}
		},

		buildPolygonLayer(val){
			var layer = this.getLayer(val);
			return layer;
		},

		addLayer(layer){
			this.addEventListeners(layer);
			if(this.pointGroup.hasLayer(layer)) {
				layer.redraw();
			}
			else {
				this.pointGroup.addLayer(layer);
			}
		},

		addPoints(){
			// if constituent layer of markers not already added to map, add it now
			if(!this.pointGroup.hasLayer(this.constituentLayer)){
				console.log('add layer')
				this.pointGroup.addLayer(this.constituentLayer);
			} else {
				this.constituentLayer.redraw();
			}
			this.$emit('toggleLoading', false)
		},

		countTrendVisits(fc){
			var uniqueVisits = [];
			this.trendVisits = 0;

			for(var i = 0; i < fc.features.length; i ++) {
				var visit = fc.features[i].SU_VisitNo;
				if(uniqueVisits.indexOf(visit) === -1) {
					uniqueVisits.push(visit);
					this.trendVisits ++;
				}
			}

			this.$emit('trendsCounted', this.trendVisits);
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