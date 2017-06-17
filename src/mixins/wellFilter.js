export default function(feature, type){
	return feature.properties['StudyType'] == type ? true : feature.properties['Purpose'] == type ? true : type == '' ? true : type == 'STATUS' ? true : false
}

	// for(var i = 0; i < this.wells.features.length; i ++){
			// 	var attributes = this.wells.features[i].attributes;
			// 	if((attributes['StudyType'] == this.studyType) || attributes['Purpose'] == this.studyType || this.studyType == '' || this.studyType == 'STATUS'){