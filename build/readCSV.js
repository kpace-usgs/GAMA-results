var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var async = require('async');
var parse = require('csv');

var inputFile = '../src/assets/thresholds.csv';

var string = '';

var parser = parse({delimiter: ','}, function(err, data) {
	async.eachSeries(data, (line, callback) => {
		string.concat(line).then(() => {
			callback();
		})
	})
});

fs.createReadStream(inputFile).pipe(parser).on('end', ()=>{
	fs.writeFile('thresholds.js', string, (err) => {
		console.log('done');
	})
});

// Set server port
app.listen(4000);
console.log('server is running');