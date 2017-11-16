<template>
	<div id='app'>
		<MapDiv
			:param = 'param'
			:type = 'type'
			:trendIndex='trendIndex'
			:layerArr = 'layers'
			:reset = 'reset'
			@toggleLoading = 'toggleLoading'
		></MapDiv>

		<PulseLoader :loading='isLoading'></PulseLoader>

		<LegendDiv :layers = 'layers' 
			:type='type' 
			:param='param'
		></LegendDiv>

		<MenuDiv 
			:infos = 'infos'
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
import esri from 'esri-leaflet'


export default {
	name: 'App',
	data() {
		return {
			layers: [],
			param: {
				PCODE: '',
				Threshold_Low: '',
				Threshold_Hi: 4,
				ThresholdSource: '',
				Benchmark: '',
				BenchmarkType: '',
				BenchmarkDefinition: '',
				Constituent: '',
				Units: '',
				LegendItems: [{
					LegendCount: 1,
					LegendItem: 1,
					Category: '',
					Symbology: ''
				}]
			},
			type: '',
			trend: '',
			trendIndex: '',
			reset: false,
			infos: [] 
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
		},
		handleType(string){
			return this.type = string;
		},
		handleTrend(index){
			/* user changes sliding trend bar in menu and the index position of that gets broadcast to the map*/
			this.trendIndex = index;
		},
		toggleReset(){
			this.reset = !this.reset;
		},

		getParamInfo(){
			/* get legend table data from server */
			var that = this;
			var thresholds = esri.query('https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/SitesLayersLegend/MapServer');
			thresholds.layer(8);

			thresholds.run( (err, fc) => {
				if(err) { console.log(err) }
				console.log(fc);
				that.infos = that.makeInfosArr(fc.features); // parse returned feature collection into a format used by the app's components
			});
		},

		// getTypeInfo(){
		// 	esri.query('https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/AllGAMAData/MapServer')
		// 	// TODO get metadata ? get all the possible trend types?
		// }

		makeInfosArr(arr) {
			var uniqueNames = []; //track constituent group names here
			var toReturn = [];

			// go through the array and look for group names that haven't been handled yet. 
			for(var i = 0; i < arr.length; i++) {

				var name = arr[i].properties.ConstituentGroup;

				// when the loop encounters a new constituent group, add that name to the tracking array
				if(uniqueNames.indexOf(name) === -1 && name !== null) {
					uniqueNames.push(name);


					// then, get array of all parameters in that group
					var uniqueParameters = []; // track which parameters have been handled
					var paramArrToReturn = [];

					// create a subarray of all objects that have the constituent group name being handled
					var paramArray = arr.filter( feature => {
						return feature.properties.ConstituentGroup == name;
					});

					// go through that subarray and handle each unique PCODE value
					for(var j = 0; j < paramArray.length; j++) {
						var param = paramArray[j].properties;

						// if not already handled, add to the object
						if(uniqueParameters.indexOf(param.PCODE) == -1 ) {

							uniqueParameters.push(param.PCODE); //push to tracking array

							// final step: get all legend items for that pcode, to show in menu
							var legendArrToReturn = [];
							var legendArray = paramArray.filter( feature => {
								return feature.properties.PCODE == param.PCODE
							});

							legendArray.forEach( legend => {
								legendArrToReturn.push({
									LegendItem: legend.properties.LegendItem,
									Category: legend.properties.Category,
									Symbology: legend.properties.Symbology
								});
							});
							// sort them in order according to LegendItem so 3 comes before 1
							legendArrToReturn.sort( (a, b) => {
								var numA = a.LegendItem;
								var numB = b.LegendItem;
								return numB - numA;
							});
							// save a parameter object
							paramArrToReturn.push({
								Constituent: param.Constituent,
								PCODE: param.PCODE,
								Threshold_Low: param.Threshold_Low,
								Threshold_Hi: param.Threshold_Hi,
								ThresholdSource: param.ThresholdSource,
								Benchmark: param.Benchmark,
								BenchmarkType: param.BenchmarkType,
								BenchmarkDefinition: param.BenchmarkDefinition,
								Units: param.Units,
								Legend: legendArrToReturn
							});
						}
					};

					toReturn.push({
						groupName: name,
						parameters: paramArrToReturn
					})
				}
			};

			console.log(toReturn)

			return toReturn;
		}
	},

	mounted(){
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		if(isIE){
			alert('It looks like you might be using Internet Explorer. Please make sure you are using a version currently supported by Microsoft (IE 10, 11, or Edge)')
		}

		this.getParamInfo();
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