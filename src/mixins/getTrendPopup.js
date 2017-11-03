import moment from 'moment';
import buildTrendGraph from './buildTrendGraph.js';

export default function(param, index, thresh){

	// if no value for the category's column has been provided, return 'Category'. If a blank string has been provided for the value, return 'N/A'
	var category = param.hasOwnProperty('statusColumns') ? param.statusColumns.category == '' ? 'N/A': param.statusColumns.category : '{Category}';


	var lookFor = param.units == 'Number of Detections' ? 'Number of Detections' : param.name == 'pH' ? 'pH' : 'Concentration';

	var column = param.hasOwnProperty('statusColumns') ? param.statusColumns.column : 'Concentration';

	var units = param.units == 'Number of Detections' ? '' : `(${param.units})`; // don't show if a number of detections constituent

	var stringToReturn = function(properties){
		var date = moment(properties.SampleDate).format('MM/DD/YYYY');

		return `<p>Study Unit: {StudyUnit}<br/>\
		GAMA ID: {GAMA_ID}<br/>\
		Sample Date: ${date}<br/>\
		${lookFor}: {${column}} ${units}<br/>\
		Category: ${category}<br/>\
		Study Unit Trend Number: {VisitNo}
		</p><div><canvas id="graph"></canvas>`
	};

	var getTrendsForGraph = function(gamaID, esriObj){
		esriObj.text(gamaID).fields("GAMA_ID");
		return buildTrendGraph(esriObj, param, column, index, thresh);
	};
	
	return {
		string: stringToReturn,
		graph: getTrendsForGraph,
		column: column
	};
};