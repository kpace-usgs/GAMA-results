export default function(feature, type){
	
	var showIf = feature.properties.StudyType == type ? true : feature.properties['Purpose'] == type ? true : type == undefined ? true : type == 'STATUS' ? true : type == '' ? true : false;

	return showIf;
}