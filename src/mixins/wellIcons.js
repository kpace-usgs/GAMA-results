import shallowIcon from '../assets/images/shallow.gif'
import deepIcon from '../assets/images/deep.gif'
import trendsIcon from '../assets/images/trends.gif'

export default function(feature, latlng, param){
	return L.marker(latlng, {
		icon: L.icon({
			iconUrl: feature.properties['StudyType'] == 'SHALLOW' ? shallowIcon : feature.properties['StudyType'] == 'DEEP' ? deepIcon : trendsIcon
		})
	}).bindPopup( () => {
		L.Util.template('<p>Study Unit: {SU}</p><p>Study Area: {SA}</p>', feature.properties);
	});
}