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
import * as d3Request from 'd3-request';

export default {
	name: 'MapDiv',
	data() {
		return {
			map: '',
			overlays: '',
			baseLayers: '',
			view: [37.7, -120.57],
			zoom: 6,
			typeLayer: L.featureGroup(),
			paramLayer: L.featureGroup(),
			wells: ''
		}
	},
	mixins: [Loader, wellFilter, wellMarkers, wellIcons, provinceStyle, paneStyle],
	props: ['param', 'type', 'layerArr'],
	watch: {
		type(){
			if(this.param == ''){
				//load data according to type and change this.wells
				this.importTypeJson();
				// importTypeJson function filters wells
			} else{
				// change which of this.wells are shown
				var that = this;
				this.filterWells(wellMarkers);
			}
		},

		layerArr(){
			// clear L.featureGroup when user changes menu selection
			if(this.typeLayer.getLayers().length > 0){
				this.typeLayer.clearLayers();
			}
			// get each selected pane layer
			for(var i = 0; i < this.layerArr.length; i++){
				this.importPaneJson(this.layerArr[i]);
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
					return 'Domestic-supply' //have to change value because geojson property is recorded as 'domestic-supply' instead of 'shallow'
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

			// if any other type than status is selected, only import one json file
			if(this.type !== 'STATUS'){
				var string = this.type.toLowerCase() == 'status' ? '' : this.type.toLowerCase();
				var url = './static/geojsons/'+this.type.toLowerCase() + '.json';
				d3Request.json(url, function(err, result){
					if(err) throw err;
					that.wells = result;
					that.filterWells(wellIcons)
				})
			} else{
				// if status is selected, then import all json files 
				// Promise.all([
				// 	import('./static/jsons/deep.json'),
				// 	import('./static/jsons/shallow.json'),
				// 	import('./static/jsons/trends.json')
				// ]).then(([deep, shallow, trends]) => {
				// 	this.wells = deep;
				// 	this.wells += shallow;
				// 	this.wells += trends;
				// }).then( () => {
				// 	//finish(this.wellIcons);
				// 	that.filterWells(wellIcons);
				// });
			}
		},

		importParamJson(){
			this.toggleLoading();
			var that = this;
			var url = './static/geojsons/'+this.param.value+'.json';
			d3Request.json(url, function(err, result){
				if(err) throw err;
				that.wells = result;
				that.filterWells(wellMarkers);
				that.toggleLoading();
			});
		},

		importPaneJson(string){
			this.toggleLoading();
			var url = './static/geojsons/' + string + '.json';
			d3Request.json(url, function(err, result){
				if(err) throw err;
				var arr = [];
				for(var i = 0; i < wells.features.length; i++){
					arr.push({
						"type": "Feature",
						"properties": wells.features[i].attributes,
						"geometry": {
							"type": "Polygon",
							"coordinates": wells.features[i].geometry.rings
						}
					});
				}
				this.typeLayer.addLayer(L.geoJson(arr, {
					style: paneStyle(feature);
				}));
			});
		},

		filterWells(callback){
			// clear paramLayer if it has any content
			if(this.paramLayer.getLayers().length != 0){
				this.paramLayer.clearLayers();
			}

			var that = this;
			// add geojson to paramLayer and call correct function for pointToLayer
			this.paramLayer.addLayer(
				L.geoJson(that.wells, 
					{
						pointToLayer: callback(feature, latlng, that.param),
						filter: wellFilter(feature, that.studyType)
					}
				)
			);
		},

		loadOverlays(){
			//save provinces as L.GeoJSON layer
			import('../../../trendsMap/src/assets/hydrologicProvinces_shrunk.json').then((provinces) => {
				this.overlays = {
					"Show Provinces" : L.geoJSON(provinces, {
						style: provinceStyle(feature);
					});
				};
			})
			.then( () => {
				// define baselayers that can be toggled between
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
				}
				// set landscape layer as default
				this.baseLayers['Topography'].addTo(this.map);
				L.control.layers(this.baseLayers, this.overlays, {collapsed: false}).setPosition('topleft').addTo(this.map);
			});
		}
	},
	mounted() {
		this.map = L.map('mapDiv').setView(this.view, this.zoom); 
		this.loadOverlays();
		this.typeLayer.addTo(this.map);
		this.paramLayer.addTo(this.map);
		this.toggleLoading(); //turn off loader spinner
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