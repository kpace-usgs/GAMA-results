import moment from 'moment';

export default function(param){

	// if no value for the category's column has been provided, return 'Category'. If a blank string has been provided for the value, return 'N/A'
	var category = param.hasOwnProperty('statusColumns') ? param.statusColumns.category == '' ? 'N/A': param.statusColumns.category : 'Category';
	console.log(category);

	var lookFor = param.units == 'Number of Detections' ? 'Number of Detections' : param.name == 'pH' ? 'pH' : 'Concentration';

	var column = param.hasOwnProperty('statusColumns') ? param.statusColumns.column : 'Concentration';

	var units = param.units == 'Number of Detections' ? '' : `(${param.units})`; // don't show if a number of detections constituent

	var stringToReturn = function(properties){
		var date = moment(properties.SampleDate).format('MM/DD/YYYY');

		return `<p>Study Unit: {StudyUnit}<br/>\
		GAMA ID: {GAMA_ID}<br/>\
		Sample Date: ${date}<br/>\
		${lookFor}: ${column} ${units}<br/>\
		Category: ${category}
		</p>`
	};
	

	return {
		string: stringToReturn,
		column: column
	}
};