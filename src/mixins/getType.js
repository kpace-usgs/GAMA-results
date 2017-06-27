export default function(feature){
	switch(feature.properties.SiteType){
		case 'T':
			return 'Trends';
			break;
		case 'S': 
			return 'Domestic-supply';
			break;
		case 'D':
			return 'Public-supply';
			break;
		default: 
			return ''
	}
}