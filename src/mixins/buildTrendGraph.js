// buildTrendGraph.js
var dataArr = [];

function buildGraph(arr) {
	console.log(arr);
	// build graph from the array
};

var runFind = function(find, trendsLength, column){
	console.log('running find function')
	
	return find.run(function(err, fc) {
		console.log('complete')
		if(err){
			return; // catch error
		}

		var result = fc.features.length > 0 ? fc.features[0].properties : {SampleDate: '', Concentration: ''};

		// in each layer save the concentration or number of detects value to an array
		dataArr.push([result.SampleDate, result[column]]);
		console.log(dataArr)
		//hack of a call-back
		if(dataArr.length === trendsLength){
			return buildGraph(dataArr);
		}
	});
};

export default function (esriFind, trendsLength, column, param){

	// get all the trend layers with def set to GAMA_ID = gamaID
	for(var i = 0; i < trendsLength; i++){

		var val = param.trends[i]; // get the number of the trends layer to query

		esriFind.layers(val); //add val info to the esri.find() object created in getData.vue

		runFind(esriFind, trendsLength, column);
	}
}