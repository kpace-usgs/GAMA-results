# GAMA - Priority Basin Project Water-Quality Results
![screenshot]('./screenshot.png')

node.js code that converted parameter result jsons by well into geojson format

```
/* define feature names */
var properties = 'attributes';
var geoType = 'Point';
var folder = 'basinResults';
// var arrayOfFileNames=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,];

// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
//var geomend = require('geojson-mend');

var arrayOfFileNames = [];
for(var i = 0; i < 49; i++){
	arrayOfFileNames.push(i.toString());
}
console.log(arrayOfFileNames);

arrayOfFileNames.forEach(function(fileName, index){
	console.log(index);
	var urlToFile = './input/basinResults/' + fileName + '.json';
	var newName =  './output/basinResults/' + fileName + '.json';
	fs.readFile(urlToFile, 'utf8', function(err, data){
		var features = JSON.parse(data).features;

		var builtGeoJson = makeGeoJson(features);

	
		fs.writeFile(newName, JSON.stringify(builtGeoJson), function(error){
			if(error) {
				console.log('error');
			} else {
				console.log('successfully wrote polygon as geojson');
			}
		})
	});
});

var makeGeoJson = function(features) {
	var geojsonFeatures = [];

	for(var i = 0; i < features.length; i ++ ){
		var attr = features[i].attributes;
		var feature = {
			"type": "Feature",
			"key": i,
			"properties" : attr,
			"geometry" : {
				"type": geoType,
				"coordinates": [
				attr.Long83, attr.Lat83]
			}
		};
		geojsonFeatures.push(feature)
	};

	return {
		"type": "FeatureCollection",
		"features": geojsonFeatures
	}
};

// Set server port
app.listen(4000);
console.log('server is running');
```