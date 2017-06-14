<template>
	<div id='mapDiv'></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

export default {
	name: 'MapDiv',
	data() {
		return {
			map: '',
			overlays: '',
			baseLayers: '',
			view: [37.7, -120.57],
			zoom: 6
		}
	},
	components: {},
	mixins: [],
	watch: {},
	methods: {
		loadOverlays(){
			//save provinces as L.GeoJSON layer
			System.import('../../../trendsMap/src/assets/hydrologicProvinces_shrunk.json').then((provinces) => {
				this.overlays = {
					"Show Provinces" : L.geoJSON(provinces, {
						style: function(feature) {
							return {
								color: 'rgb(' + feature.properties.Color + ')',
								weight: 1,
								zIndex: 200,
								fillOpacity: 0.4, 
								fillColor: 'rgb(' + feature.properties.Color + ')'
							}
						}
					})
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
		this.$emit('toggleLoading');
		this.loadOverlays();
	}
}
</script>


<style> 

#mapDiv{
	height: 100%;
	min-height: 100vh;
	width: 100%;
}


</style>