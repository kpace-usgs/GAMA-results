<template>
	<div id='app'>
		<MapDiv
			:param = 'param'
			:type = 'type'
			:trend='trend'
			:trendIndex='trendIndex'
			:layerArr = 'layers'
			:reset = 'reset'
			:thresh = 'threshVals.Threshold'
			@toggleLoading = 'toggleLoading'
		></MapDiv>

		<PulseLoader :loading='isLoading'></PulseLoader>

		<LegendDiv :layers = 'layers' 
			:type='type' 
			:param='param'
			:thresh='threshVals'>
		</LegendDiv>

		<MenuDiv 
			@changeLayer='handleLayer' 
			@changeParam='handleParam'
			@changeType='handleType'
			@changeTrend = 'handleTrend'
			@resetClicked = 'toggleReset'
		></MenuDiv>
	</div>
</template>

<script>
import MapDiv from './components/mapDiv.vue';
import LegendDiv from './components/legend';
import MenuDiv from './components/menu';
import Loader from './mixins/loader.vue';
import * as esriFunctions from './mixins/esriFunctions.js'



export default {
	name: 'App',
	data() {
		return {
			layers: [],
			param: '',
			type: '',
			trend: '',
			trendIndex: '',
			reset: false,
			thresholds: '',
			threshVals: {
				Threshold: 4
			}
		}
	},
	components: {
		MapDiv, MenuDiv, LegendDiv
	},

	mixins: [ Loader],
	methods: {
		handleLayer(arr){
			this.layers = arr;
		},
		handleParam(obj){
			this.param = obj;
			/* once updated, get data from arcserver and pass threshold values to the legend */
			var that = this;

			if(this.param.hasOwnProperty('pcode')){
				this.thresholds.where("PCODE = '" + obj.pcode + "'");

				this.thresholds.run(function(err, fc) {
					if(err){ console.log(err); }
					console.log(fc);
					that.threshVals = fc.features[0].properties;

					//TODO change how this.threshVals gets saved to match Bryant's news format
					/* for(var i = 0; i < fc.features.length; i++) {
						that.threshVals.legendItems.push({name: fc.features[i].properties.BenchmarkName, symbology: fc.features[i].properties.Symbology})
					}
					*/
				});
			}else {
				this.threshVals.Threshold = 4;
			}
		},
		handleType(string){
			return this.type = string;
		},
		handleTrend(trend, index){
			this.trend = trend;
			this.trendIndex = index;
		},
		toggleReset(){
			this.reset = !this.reset;
		}
	},
	mounted(){
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		if(isIE){
			alert('It looks like you might be using Internet Explorer. Please make sure you are using a version currently supported by Microsoft (IE 10, 11, or Edge)')
		}

		this.thresholds = esriFunctions.getTable('https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/data/MapServer/');
		this.thresholds.layer(8);
	}
}
</script>

<style>

body {
    font-family: 'Calibri', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    margin:0;
    padding:0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    line-height: 1.428;
}

h2, h3, h4, h5, h6  {
font-weight: 400;
line-height: 1.1;
}

h1 {
font-size: 16px;
font-weight: 700;
line-height: 1.1;
}

h2, h3 {
font-size: 16px;
}


/* Container CSS */
.container{
    position: absolute;
    z-index: 1000;
    max-width:300px;
    background: white;
    padding: .5em;
    font-size: 14px;
}

#query{
    display:show;
}

.Shut{
  width:110px !important;
}

/* Legend CSS */

.ShutL{
  width:110px !important;
  margin-bottom:-20px !important;
}


.leaflet-popup-content-wrapper>.leaflet-popup-content{
	margin: 5px;
}
.lealet-popup-content p{
	margin: 0;
}
</style>