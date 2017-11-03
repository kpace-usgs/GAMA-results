// buildTrendGraph.js
import Chart from 'chart.js';

var chartData = [];
var index;
var yTitle;
var max = 0;

function buildGraph() {
	
	/* declare variables used by chart from chartData array*/
	function createFromArr(arr, key) {
		return arr.map((dataPoint, i) => {return dataPoint[key]})
	};
	var labels = createFromArr(chartData, 'label');
	var data = createFromArr(chartData, 'data');
	var colors = Array(chartData.length).fill().map((item, i) => { 
		var color = i === index ? '#896FC3'  : '#CCC5CE' ;
		return color;
	});

	var hoverColors = Array(chartData.length).fill().map(() => { '#896FC3' });

	var ctx = document.getElementById('graph').getContext('2d');
	// build graph from the array
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				data: data,
				pointBackgroundColor: colors,
				pointHoverBackgroundColor: hoverColors,
				pointBorderColor: 'black',
				lineTension: 0
			}]
		},
		options: {
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					ticks: {
						min: 0,
						max: max,
						stepSize: 1
					},
					scaleLabel: {
						display: true,
						labelString: yTitle
					}
				}],
				xAxes: [{
					time: {
						unit: 'month'
					},
					scaleLabel: {
						display: true,
						labelString: 'Sample Date'
					}
				}]
			}
		}
	});
};

// function that will sort the returned array to keep in order of trend visits
function compare(a, b){
	if(a.index < b.index) {
		return -1;
	} else if( a.index > b.index) {
		return 1;
	}
	return 0;
};

var runFind = function(find, trendsLength, i, column){
	
	return find.run(function(err, fc) {

		if(err){
			return; // catch error
		}

		/* push featurecollection results into chartData array. include the i value so that the array can be sorted */
		var labelString = '';
		var dataVal = null;
		var hasResults = fc.features.length > 0;
		if(hasResults){
			labelString = fc.features[0].properties.SampleDate;
			dataVal = fc.features[0].properties[column];
		};

		chartData.push({
			index: i,
			label: labelString,
			data: dataVal
		});

		/* hack of a call-back */
		if(chartData.length === trendsLength){
			chartData.sort(compare) // sort chartData by index value
			return buildGraph(index);
		}
	});
};


/* function called as buildTrendGraph() */
export default function (esriObj, param, column, trendsIndex, thresh){

	console.log('threshold: ' + thresh);
	max = thresh;
	//reset values
	chartData = [];

	//save index and units values to local variables
	index = trendsIndex;
	yTitle = param.units;

	// get all the trend layers with def set to GAMA_ID = gamaID
	for(var i = 0; i < param.trends.length ; i++){

		var val = param.trends[i]; // get the number of the trends layer to query

		esriObj.layers(val); //add val info to the esri.find() object created in getData.vue

		runFind(esriObj, param.trends.length, i, column);
	}

	return ''
}