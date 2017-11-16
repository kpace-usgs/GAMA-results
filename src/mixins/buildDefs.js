

/*********************/
/* return a SQL query string that filters by type and pcode */
/********************/
export default (type, pcode) => {

	// type can be 0 (public trends), 1 (domestic status) , 2 (public status), 3 (all), or 4 (domestic trends), or '' if no study type has been selected
	var typeFunction = function(){
		var string = '';
		switch(type) {
			case "0":
				string = "Public-supply Trends Sites"
				break;
			case "1":
				string = 'Domestic-supply Aquifer Sites'
				break;
			case "2": 
				string = 'Public-supply Aquifer Sites'
				break;
			case "4": 
				string = 'Domestic-supply Trends Sites'
				break;
			default:
				string = '';
		};


		return type == 3 || type === "" ? '' : `StudyType = "${string}"`
	};

	var trendFunction = () => {
		// if type == 0 or type == 4, get all results, but if type == "" or 1 or 2, only get first trend result

		return type == 0 || type == 4 || type == "" ? '' : ` and SU_VisitNo = "1"`
	};

	// save results
	var typeString = typeFunction();

	var trendString = trendFunction();
	
	return typeString;
	//return `PCode = "${pcode}"${typeString}`;
}