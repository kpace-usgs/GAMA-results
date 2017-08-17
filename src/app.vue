<template>
	<div id='app'>
		<MapDiv
			:param = 'param'
			:type = 'type'
			:layerArr = 'layers'
			:reset = 'reset'
			@sendZoom = 'handleZoom'
			@toggleLoading = 'toggleLoading'
		></MapDiv>

		<PulseLoader :loading='isLoading'></PulseLoader>

		<LegendDiv :layers = 'layers' 
			:type='type' 
			:param='param'>
		</LegendDiv>

		<MenuDiv 
			@changeLayer='handleLayer' 
			@changeParam='handleParam'
			@changeType='handleType'
			@resetClicked = 'toggleReset'
			:zoom = 'zoom'
		></MenuDiv>
	</div>
</template>

<script>
import MapDiv from './components/mapDiv.vue';
import LegendDiv from './components/legend';
import MenuDiv from './components/menu';
import Loader from './mixins/loader.vue';


export default {
	name: 'App',
	data() {
		return {
			layers: [],
			param: '',
			type: '',
			zoom: '',
			reset: false
		}
	},
	components: {
		MapDiv, MenuDiv, LegendDiv
	},
	mixins: [ Loader ],
	methods: {
		handleLayer(arr){
			this.layers = arr;
		},
		handleParam(string){
			this.param = string;
		},
		handleType(string){
			return this.type = string;
		},
		handleZoom(level){
			this.zoom = level;
		},
		toggleReset(){
			this.reset = !this.reset;
		}
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

</style>