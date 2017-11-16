import * as wellColors from './wellColor.js';

function color(feature, param) {
	var result = parseInt(feature.properties.LabValue);
	var thresh_low = param.Threshold_low ? parseInt(param.Threshold_Low) : parseInt(param.Legend[param.LegendCount - 1].Category); //e.g. 1 Detect Count
	var thresh_hi = param.Threshold_Hi ? parseInt(param.Threshold_Hi) : parseInt(param.Legend[0].Category.slice(-1));


	if( result > thresh_hi) {
		return wellColors.hi;
	}
	else if (result > thresh_low) {
		return wellColors.med
	}
	else if(result == 0) {
		return wellColors.none
	}
	else {
		return wellColors.low;
	}
};

export default (feature, latlng, param) => {

	return L.circleMarker(latlng, {
		fillColor: color(feature, param),
		fillOpacity: 1,
		weight: 0.5,
		opacity: 1,
		color: 'black',
		radius: 4,
		zIndexOffset: 40
	})
};