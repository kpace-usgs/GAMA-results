export default function(feature){
	return {
		color: 'black',
		weight: 0.5,
		fillColor: 'rgb(' + feature.properties.Color + ')',
		opacity: 0.8
	}
};