

/*********************/
/* return a SQL query string that filters by type and pcode */
/********************/
export default (type, pcode) => {

	// type can be 0 (public trends), 1 (domestic status) , 2 (public status), 3 (all), or 4 (domestic trends)
	var typeFunction = function(){
		var string = '';
		switch(type) {
			case 0:
				string = "Public-supply Trends Sites"
				break;
			case 1:
				string = 'Domestic-supply Aquifer Sites'
				break;
			case 2: 
				string = 'Public-supply Aquifer Sites'
				break;
			case 4: 
				string = 'Domestic-supply Trends Sites'
				break;
			default:
				string = '';
		};


		return type === 3 ? '' : `StudyType = ${string}`
	};

	// save results
	var typeString = typeFunction();
	
	// get array of conjunction strings
	var and = typeString.length > 0 ? ' and ' : '';

	return `PCODE = ${pcode}${and}${typeString}`;
}