export default function(feature, type){

	var showIf = feature.properties['StudyType'] == type ? true : feature.properties['Purpose'] == type ? true : type == '' ? true : type == 'STATUS' ? true : false;
	return showIf;
}