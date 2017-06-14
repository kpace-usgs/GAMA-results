<template>
	<div id='app'>
		<MapDiv @toggleLoading = 'toggleLoading'></MapDiv>

		<PulseLoader :loading='isLoading'></PulseLoader>

		<LegendDiv 	:showLegend = 'showControls' 
					:layers = 'layers' :type='type' :param='param'>
			
		</LegendDiv>

		<MenuDiv :showControls='showControls' 
			@changeLayer='handleLayer' 
			@changeParam='handleParam'
			@changeType='handleType'
		></MenuDiv>
	</div>
</template>

<script>
import MapDiv from './components/mapDiv';
import LegendDiv from './components/legend';
import MenuDiv from './components/menu';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';


export default {
	name: 'App',
	data() {
		return {
			isLoading: true,
			width: '',
			showControls: '',
			mobileBound: 600,
			layers: [],
			param: '',
			type: ''
		}
	},
	components: {
		MapDiv, PulseLoader, MenuDiv, LegendDiv
	},
	methods: {
		onResize() {
			this.width = window.innerWidth;
			this.showControls = this.width < this.mobileBound ? false : true;
		},
		toggleLoading() {
			this.isLoading = !this.isLoading;
		},
		handleLayer(arr){
			this.layers = arr;
		},
		handleParam(string){
			this.param = string;
		},
		handleType(string){
			this.type = string;
		},
		change(){

		}
	},
	mounted() {
		window.addEventListener('resize', this.onResize);
		this.onResize();
	}
}
</script>

<style>

body {
    font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
    margin:0;
    padding:0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.428;
}

h1, h2, h3, h4, h5, h6  {
font-weight: 700;
line-height: 1.1;
}

h1 {
font-size: 18px;
}

h2 {
font-size: 16px;
}

h3 {
font-size: 14px;
}

/* Container CSS */
#container {
    position: absolute;
    top: 50px;
    right: 10px;
    z-index: 1000;
    max-width:300px;
    background: white;
    padding: .5em;
    font-size:10pt;
}
#query{
    display:show;
}

.Shut{
  width:110px !important;
}

/* Legend CSS */
#legend{
    display:show;
}
#map_legend {
    padding:.5em;
	font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
	color: #404040;
	position: absolute;
	bottom: 10px;
	left: 10px;
	z-index: 1000;
    padding-bottom:20px;
}

.ShutL{
  width:110px !important;
  margin-bottom:-20px !important;
}

.leaflet-bar{
    background-color:white;
}
.v-spinner{
    position: absolute;
    top: 50px;
    left: 50%;
    right: 50%;
    z-index: 1010;
}
</style>