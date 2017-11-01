// buildTrendGraph.js
import Chart from 'chart.js';

var dataArr;
var labelArr;

function buildGraph() {
	var ctx = document.getElementById('graph').getContext('2d')

	// build graph from the array
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labelArr,
			datasets: [{
				data: dataArr
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
						max: 4,
						stepSize: 1
					},
					scaleLabel: {
						display: true
					}
				}],
				xAxes: [{
					time: {
						unit: 'month'
					}
				}]
			}
		}
	});
};

var runFind = function(find, trendsLength, column){
	console.log(column);
	
	return find.run(function(err, fc) {
		console.log('complete')
		if(err){
			return; // catch error
		}

		//var result = fc.features.length > 0 ? fc.features[0].properties : {SampleDate: '', Concentration: ''};
		var resultLabel,
			resultData;

		if(fc.features.length > 0){
			resultLabel = fc.features[0].properties.SampleDate;
			resultData = fc.features[0].properties[column];
			console.log(fc.features[0].properties);
		} else {
			resultLabel = 'Not sampled';
			resultData = ''
		}

		// in each layer save the concentration or number of detects value to an array
		//dataArr.push([result.SampleDate, result[column]]);
		dataArr.push(resultData);
		labelArr.push(resultLabel)
		console.log(dataArr)
		//hack of a call-back
		if(dataArr.length === trendsLength){
			return buildGraph();
		}
	});
};


/* function called as buildTrendGraph() */
export default function (esriFind, trendsLength, column, param){

	//reset values
	dataArr = [];
	labelArr = [];

	// get all the trend layers with def set to GAMA_ID = gamaID
	for(var i = 0; i < trendsLength; i++){

		var val = param.trends[i]; // get the number of the trends layer to query

		esriFind.layers(val); //add val info to the esri.find() object created in getData.vue

		runFind(esriFind, trendsLength, column);
	}

	return ''
}