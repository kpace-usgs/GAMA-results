import wellColor from './wellColor.js';


export default function(feature, latlng, param){
	// determine category, paramString, and style from feature
	var paramString;
	var category;

	// update paramString and category
	switch(param){
		case 15: 
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {FungicideC}<br/># Detections: {Fungicid_1}</p>';
			category = feature.properties.FungicideC;
			break;
		case 16: 
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {GasolineCatg}<br/># Detections: {GasolineCt}</p>';
			category = feature.properties.GasolineCatg;
			break;
		case 17:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideC}<br/># Detections: {Herbicid_1}</p>';
			category = feature.properties.HerbicideC;
			break;
		case 18:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideCatg}<br/># Detections: {HerbicideCt}</p>';
			category = feature.properties.HerbicideCatg;
			break;
		case 19:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Insecticid}<br/># Detections: {Insectic_1}</p>';
			category = feature.properties.Insecticid;
			break;
		case 24:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			category = feature.properties.DetectCounts;
			break;
		case 29:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {OrgSynthCatg}<br/># Detections: {OrganicSynthesisCt}</p>';
			category = feature.properties.OrgSynthCatg;
			break;
		case 30:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/># Detections: {Concentrat}</p>';
			category = feature.properties.Category;
			break;
		case 31:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>pH: {Concentration}</p>';
			category = feature.properties.Concentration;
			break;
		case 32: 
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			category = feature.properties.DetectCounts;
			break;
		case 35:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {RefrigerantCatg}<br/># Detections: {RefrigerantCt}</p>';
			category = feature.properties.RefrigerantCatg;
			break;
		case 40:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {SolventCatg}<br/># Detections: {SolventCt}</p>';
			category = feature.properties.SolventCatg;
			break;
		case 44:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {TrihalomethaneCatg}<br/># Detections: {TrihalomethaneCt}</p>';
			category = feature.properties.TrihalomethaneCatg;
			break;
		default:
			paramString = '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/># Detections: {Concentration}</p>';
			category = feature.properties.Category;
			break;
	}

	var opacity = category == 'High' || parseInt(category) > 3 ? 0.3 : 1;

	return L.circleMarker(latlng, {
		fillColor: wellColor(param, category),
		fillOpacity: opacity,
		weight: 1,
		opacity: opacity,
		color: 'black',
		radius: 4,
		zIndexOffset: 4
 	}).bindPopup(() => {
 		return L.Util.template(paramString, feature.properties);
 	});

}