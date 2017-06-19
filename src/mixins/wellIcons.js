import shallowIcon from '../assets/images/shallow.gif'
import deepIcon from '../assets/images/deep.gif'
import trendsIcon from '../assets/images/trends.gif'

export default function(feature, latlng, param, type){

	return L.marker(latlng, {
		icon: L.icon({
			iconUrl: type == 'Domestic-supply' ? shallowIcon : type == 'Public-supply' ? deepIcon : trendsIcon
		})
	}).bindPopup( () => {
		return L.Util.template('<p>Study Unit: {SU}</p><p>Study Area: {SA}</p>', feature.properties);
	});
}