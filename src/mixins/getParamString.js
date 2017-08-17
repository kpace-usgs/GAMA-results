export default function(param){

	switch(param){
		case 15: 
			return {
				category: 'FungicideCatg',
				lookFor: '# Detections',
				value: 'FungicideCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {FungicideCatg}<br/># Detections: {FungicideCt}</p>';
			break;
		case 16: 
			return {
				category: 'GasolineCatg',
				lookFor: '# Detections',
				value: 'GasolineCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {GasolineCatg}<br/># Detections: {GasolineCt}</p>';
			break;
		case 17:
			return {
				category: 'HerbicideCatg',
				lookFor: '# Detections',
				value: 'HerbicideCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideCatg}<br/># Detections: {HerbicideCt}</p>';
			break;
		case 18:
			return {
				category: 'HerbicideCatg',
				lookFor: '# Detections',
				value: 'HerbicideCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideCatg}<br/># Detections: {HerbicideCt}</p>';
			break;
		case 19:
			return {
				category: 'InsecticideCatg',
				lookFor: '# Detections',
				value: 'InsecticideCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {InsecticideCatg}<br/># Detections: {InsecticideCt}</p>';
			break;
		case 24:
			return {
				category: 'n/a',
				lookFor: '# Detections',
				value: 'DetectCounts'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			break;
		case 29:
			return {
				category: 'OrgSynthCatg',
				lookFor: '# Detections',
				value: 'OrganicSynthesisCt'
			}
			//return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {OrgSynthCatg}<br/># Detections: {OrganicSynthesisCt}</p>';
			break;
		case 30:
			return {
				category: 'Category',
				lookFor: '# Detections',
				value: 'Concentrat'
			}
			//return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/># Detections: {Concentrat}</p>';
			break;
		case 31:
			return {
				category: 'n/a',
				lookFor: 'pH',
				value: 'Concentration'
			}
			//return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>pH: {Concentration}</p>';
			break;
		case 32: 
			return {
				category: 'n/a',
				lookFor: '# Detections',
				value: 'DetectCounts'
			}
			//return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			break;
		case 35:
			return {
				category: 'RefrigerantCatg',
				lookFor: '# Detections',
				value: 'RefrigerantCt'
			}
			//return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {RefrigerantCatg}<br/># Detections: {RefrigerantCt}</p>';
			break;
		case 40:
			return {
				category: 'SolventCatg',
				lookFor: '# Detections',
				value: 'SolventCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {SolventCatg}<br/># Detections: {SolventCt}</p>';
			break;
		case 44:
			return {
				category: 'TrihalomethaneCatg',
				lookFor: '# Detections',
				value: 'TrihalomethaneCt'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {TrihalomethaneCatg}<br/># Detections: {TrihalomethaneCt}</p>';
			break;
		default:
			return {
				category: 'Category',
				lookFor: 'Concentration',
				value: 'Concentration'
			}
			// return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/>Concentration: {Concentration}</p>';
			break;
		}
}