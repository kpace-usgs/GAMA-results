import moment from 'moment';

export default function(param, properties){

	var layerDetails;
	// define the name of the category column if it exists, and what value (concentrations, number of detections, or pH) is being categorized. Column is the name of the column in which those values live on arcServer

	switch(param){
		case 15: 
			layerDetails = {
				category: 'FungicideCatg',
				lookFor: '# Detections',
				column: 'FungicideCt'
			}
			break;
		case 16:
			layerDetails = {
				category: 'GasolineCatg',
				lookFor: '# Detections',
				column: 'GasolineCt'
			}
			break;
		case 17: 
			layerDetails = {
				category: 'HerbicideCatg',
				lookFor: '# Detections',
				column: 'HerbicideCt'
			}
			break;
		case 18: 
			layerDetails = {
				category: 'HerbicideCatg',
				lookFor: '# Detections',
				column: 'HerbicideCt'
			}
			break;
		case 19: 
			layerDetails = {
				category: 'InsecticideCatg',
				lookFor: '# Detections',
				column: 'InsecticideCt'
			}
		break;
		case 20:
			layerDetails = {
				category: 'Category',
				lookFor: 'pH',
				column: 'Concentration'
			}
			break;
		case 24: 
			layerDetails = {
				category: '',
				lookFor: '# Detections',
				column: 'DetectCounts'
			}
		break;
		case 29:
			layerDetails = {
				category: 'OrgSynthCatg',
				lookFor: '# Detections',
				column: 'OrganicSynthesisCt'
			}
		break;
		case 32: 
			layerDetails = {
				category: '',
				lookFor: '# of Detections',
				column: 'DetectCounts'
			}
			break;
		case 35:
			layerDetails = {
				category: 'RefrigerantCatg',
				lookFor: '# Detections',
				column: 'RefrigerantCt'
			}
			break;
		case 38:
			layerDetails = {
				category: 'SolventCatg',
				lookFor: '# Detections',
				column: 'SolventCt'
			}
			break;
		case 44:
			layerDetails = {
				category: 'TrihalomethaneCatg',
				lookFor: '# Detections',
				column: 'TrihalomethaneCt'
			}
			break;
		default:
			layerDetails = {
				category: 'Category',
				lookFor: 'Concentration',
				column: 'Concentration'
			}
	};


	var category = layerDetails.category == '' ? 'N/A': `{${layerDetails.category}}` 


	var stringToReturn = function(properties){
		var date = moment(properties.Dates).format('MM-DD-YYYY');

		return `<p>Study Unit: {StudyUnit}<br/>\
		GAMA ID: {GAMA_ID}<br/>\
		${layerDetails.lookFor}: {${layerDetails.column}}<br/>\
		Category: ${category}<br/>\
		Sample Date: ${date}
		</p>`
	};
	

	return {
		string: stringToReturn,
		column: layerDetails.column
	}
};