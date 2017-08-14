export default function(param){

	switch(param){
		case 15: 
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {FungicideCatg}<br/># Detections: {FungicideCt}</p>';
			break;
		case 16: 
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {GasolineCatg}<br/># Detections: {GasolineCt}</p>';
			break;
		case 17:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideC}<br/># Detections: {Herbicid_1}</p>';
			break;
		case 18:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {HerbicideCatg}<br/># Detections: {HerbicideCt}</p>';
			break;
		case 19:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {InsecticideCatg}<br/># Detections: {InsecticideCt}</p>';
			break;
		case 24:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			break;
		case 29:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {OrgSynthCatg}<br/># Detections: {OrganicSynthesisCt}</p>';
			break;
		case 30:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/># Detections: {Concentrat}</p>';
			break;
		case 31:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>pH: {Concentration}</p>';
			break;
		case 32: 
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/># Detections: {DetectCounts}</p>';
			break;
		case 35:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {RefrigerantCatg}<br/># Detections: {RefrigerantCt}</p>';
			break;
		case 40:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {SolventCatg}<br/># Detections: {SolventCt}</p>';
			break;
		case 44:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {TrihalomethaneCatg}<br/># Detections: {TrihalomethaneCt}</p>';
			break;
		default:
			return '<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {Category}<br/>Concentration: {Concentration}</p>';
			break;
		}
}