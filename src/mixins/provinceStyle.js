export default function(feature){
	return {
		color: 'rgb(' + feature.properties.Color + ')',
		weight: 1,
		zIndex: 200,
		fillOpacity: 0.4, 
		fillColor: 'rgb(' + feature.properties.Color + ')'
	}
};