export default function(param, cat){
	// if the parameter is pH, the color scale is different
	if(param == 31){
		return parseInt(this.category) > 8.5 ? '#A36CD1' : parseInt(this.category) > 6.5 ? '#8BE3F0' : '#EDE852';
	} else{
		if(cat == 'Low' || cat == 1){
			return '#8BE3F0';
		} else if(cat == 'Moderate' || parseInt(cat) == 2 || parseInt(cat) == 3){
			return '#5D9664';
		} else if(cat == 'High' || parseInt(cat) > 3){
			return 'white';
		}
	}
}