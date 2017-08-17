<template>
	<div id='mapDiv'></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

import ParamData from '../mixins/getParamData.vue'
import getType from '../mixins/getType.js'
import getLayerPopup from '../mixins/getLayerPopup.js'
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
	props: ['param', 'type', 'layerArr', 'reset'],
	watch: {
		type(){	
			if(this.type.length > 0){
				// if a constituent has already been selected, this.constituentLayer will already be populated
				if(typeof(this.param.value) == 'number') {
					this.decideHowToFilter(this.constituentLayer);

				} else {
					// load the wells by type and add to the map
					this.pointGroup.clearLayers();
					this.importTypeJson();
					this.addConstituentLayer();
				}
			}

		},

		param(){

			/* if selection box has a value, save this.constituentLayer as an esri.featureLayer */
			if(this.param.value){
				this.constituentLayer = this.importParamGeometry(this.param.value);
				this.pointGroup.clearLayers(); //clear the existing layer


				/* if the groundwater study type is also selected, run a query() on the param layer */
				if(this.type != ''){
					this.decideHowToFilter(this.constituentLayer);
				} 
				
				this.addConstituentLayer(); // add to this.pointGroup if not there already
			}

			/* if selection box was changed to no value, clear the layers */
			else {
				this.pointGroup.clearLayers();
			}
		},

		layerArr(){
			//clear L.featureGroup when user changes menu selection
			this.polygonGroup.clearLayers();

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
		},

		reset(){
			this.checkReset();
		}
	},
	
	methods: {

		importTypeJson(){
			this.constituentLayer = esri.dynamicMapLayer({
				url: 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/sites/MapServer/',
				layers: [this.type]
			}).bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + getType(featureCollection.features[0]);
				}
			});
		},

		importPaneJson(val){
			console.log('layer to import as dynamicMapLayer: ' + val);

			var layer = esri.dynamicMapLayer({
				url: 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/base_layers/MapServer/',
				layers: [val],
				minZoom: 4,
				position: val == 4 ? 'back' : 'front',
			}).bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return featureCollection.features[0].properties[getLayerPopup(val)]
				}
				
			});

			this.polygonGroup.addLayer(layer); // add to map			
		},

		addConstituentLayer(){
			// if constituent layer of markers not already added to map, add it now
			if(!this.pointGroup.hasLayer(this.constituentLayer)){
				this.pointGroup.addLayer(this.constituentLayer).bringToFront();

				// toggle loading when beginning to load
				this.constituentLayer.on('loading', e => {
					this.$emit('toggleLoading', true);
				})
				// also set condition to toggle loader when done loading
				this.constituentLayer.on('load', e => {
					this.$emit('toggleLoading', false);
				});
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

		var that = this;
		this.map.on('zoom', () => {
			console.log(that.map.getZoom());
			that.$emit('sendZoom', that.map.getZoom());
		});

		// initially emit the zoom level
		this.$emit('sendZoom', this.map.getZoom());

		L.control.scale({position: 'bottomright'}).addTo(this.map); 
		this.loadOverlays();

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