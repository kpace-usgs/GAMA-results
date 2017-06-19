export default function(param, cat){
	var color;
	// if the parameter is pH, the color scale is different
	if(param == 31){
		color = parseInt(this.category) > 8.5 ? '#A36CD1' : parseInt(this.category) > 6.5 ? '#8BE3F0' : '#EDE852';
		return color;
	} else{
		if(cat == 'Low' || cat == 1){
			color = '#8BE3F0';
			return color;
		} else if(cat == 'Moderate' || parseInt(cat) == 2 || parseInt(cat) == 3){
			color = '#5D9664';
			return color;
		} else if(cat == 'High' || parseInt(cat) > 3){
			color = 'white';
			return color;
		}
	}
}