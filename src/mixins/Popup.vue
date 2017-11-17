<script>
import moment from 'moment';
import Chart from 'chart.js';

/* must be a mixin to a component that has state values for param */
export default {
	name: 'getTrendPopup',
	data(){
		return {
			chartData: [],
			canvas: document.createElement('canvas'),
			popup: document.createElement('div'),
			results: document.createElement('div'),
			chart: '',
			popupProperties: '',
			numOfSamples: 0
		}
	},

	computed: {
		category() {
			// if no value for the category's column has been provided, return 'Category'. If a blank string has been provided for the value, return 'N/A'
			return this.param.Units ? 'properties.Category' : 'N/A'; // number of detects type constituents aren't categorized
		},

		lookFor() {
			return this.param.Constituent === 'pH' ? 'pH' : this.param.Units ? 'Concentration' : 'Number of Detections'; // the server approach still doesn't include text for what this label should be.
		},


		units(){
			return this.param.Units ? `(${this.param.Units})` : ''; //don't show if a number of detections constituent
		},

		trendsLength(){
			return 4 //TODO pass this value from getData.vue
		},

		// backgroundColors(){
		// 	return Array(this.chartData.length).fill().map((item, i) => {
		// 		return i === this.trendIndex ? '#896FC3'  : '#CCC5CE' ;
		// 	});
		// }
	},

	watch: {
		trendIndex(){
			// watch for change in trend index and if there's a chart attached to this.chart value, change the array of colors and the data shown in the popup
			if(this.chart.hasOwnProperty('data') && this.trendIndex !== ''){
				this.chart.data.datasets[0].pointBackgroundColor = this.backgroundColors;
				this.chart.update();
				this.results.innerHTML = ''; //clear
				var properties = this.chartData[this.trendIndex].properties;
				if(properties.hasOwnProperty('StudyUnit')){
					this.results.insertAdjacentHTML('beforeend', this.returnString(properties) + `<br/>Study Unit Trend Visit: ${properties.VisitNo}</p>`); //add additional line
				}
				else {
					this.results.insertAdjacentHTML('beforeend', `<p>Study Unit: ${this.popupProperties.StudyUnit}<br/>GAMA ID: ${this.popupProperties.GAMA_ID}<br/>Sample Date: Not sampled in this visit<br/>${this.lookFor}: N/A ${this.units}<br/>Category: N/A<br/>Study Unit Trend Visit: Trend${this.trendIndex}<br/>Number of Samples at this Well: ${this.numOfSamples}</p>`)
				}
				
			}
		}
	},

	mounted(){
		this.popup.insertAdjacentElement('afterbegin', this.results);
	},

	methods: {
		returnParamPopup(properties) {
			this.results.innerHTML = ''; //clear popup
			this.canvas.remove(); //remove canvas from popup if its been added previously
			this.results.insertAdjacentHTML('beforeend', this.returnString(properties));
			this.results.insertAdjacentHTML('beforeend', '</p>');
			return this.popup;
		},

		returnString(properties){
			var date = moment(properties.SampleDate).format('MM/DD/YYYY');

			return `<p>Study Unit: ${properties.StudyUnit}<br/>\
			USGS Station ID: ${properties.USGSStationID}<br/>\
			Sample Date: ${date}<br/>\
			${this.lookFor}: ${properties.ReptValue} ${this.units}<br/>\
			Category: ${this.param.Units ? properties.Category : "N/A"}`
		},

		returnTrendPopup(properties, featureCollection){
			// insert the canvas element if it's not already in the popup (it's removed for non-trends popups)
			if(this.popup.childNodes[this.popup.childNodes.length - 1].nodeName != "CANVAS"){
				this.popup.insertAdjacentElement('beforeend', this.canvas);
			}
			this.results.innerHTML = ''; //clear popup
			this.canvas.innerHTML = ''; //clear canvas
			this.numOfSamples = 0; //reset
			this.popupProperties = properties;
			this.chartData = []; //clear array
			if(this.chart){ this.chart.destroy()}
			this.results.insertAdjacentHTML('afterbegin', this.returnString(properties) + `<br/>Study Unit Trend Visit: ${properties.SU_VisitNo}<br/>`); //add additional line
			//this.popup.insertAdjacentElement('beforeend', this.canvas);

			// send that feature's USGSStationID to the buildGraph function, which will return the popup
			return this.buildGraph(properties.USGSStationID, featureCollection);
		},

		/* run the esri find object for rows where GAMA_ID = gamaID */
		buildGraph(id, featureCollection) {
			console.log('filter to only see usgsstationid equal to ' + id);
			var uniqueVals = [];
			// filter featureCollection to only those where GAMA_ID = gamaID
			var filtered = featureCollection.features.filter(feature => {
				var idVal = feature.properties.USGSStationID; //save as shorter variable
				var visit = feature.properties.SU_VisitNo;
				// only add this feature to the filtered array if it matches the id AND if that SU Trend visit isn't already represented
				if(idVal == id) {
					if(uniqueVals.indexOf(visit) == -1) {
						uniqueVals.push(visit); // save
						return true;
					}
				}
				return false;
			});

			console.log(filtered);


			// create all charts to have same number of x intervals as slider in menu has, using this.trendVisits across components
			for(var i = 1; i <= this.trendVisits; i ++){

				// find the filtered value for trendVisit i
				var result = filtered.find(item => {
					return parseInt(item.properties.SU_VisitNo) == i 
				});
	
				// push data into form that will go to the chart
				this.chartData.push({
					index: i,
					label: result ? result.properties.SampleDate : 'NA',
					data: result ? parseInt(result.properties.ReptValue) : null,
					properties: result ? result.properties: {}
				});
			};

			// add final line to popup now that numOfSamples has been calculated
			this.results.insertAdjacentHTML('beforeend', `Number of Samples at this Well: ${filtered.length}</p>`);
			
			this.createChart(this.trendIndex);

			return this.popup;

		},

		createChart(index) {
			/* declare variables used by chart from chartData array*/

			//createFromArr is resable function for creating labels, data, and hovercolors
			function createFromArr(arr, key) {
				return arr.map((dataPoint, i) => {return dataPoint[key]})
			};
			var labels = createFromArr(this.chartData, 'label');
			var data = createFromArr(this.chartData, 'data');
			var hoverColors = Array(this.chartData.length).fill().map(() => { '#896FC3' });
			var backgroundColors = Array(this.chartData.length).fill().map((item, i) => {
				return i === this.trendIndex ? '#896FC3'  : '#CCC5CE' ;
			});

			console.log(data);
			console.log(labels);

			// build graph from the array
			var graph = this.canvas.getContext('2d')
			this.chart = new Chart(graph, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [{
						data: data,
						pointBackgroundColor: backgroundColors,
						pointHoverBackgroundColor: hoverColors,
						pointBorderColor: 'black',
						lineTension: 0
					}]
				},
				options: {
					legend: {
						display: false
					},
					scales: {
						yAxes: [{
							ticks: {
								min: 0,
								max: this.param.Threshold_Hi ? this.param.Threshold_Hi * 1.5 : 4,
								stepSize: this.param.Threshold_Hi ? this.param.Threshold_Hi / 4 : 1
							},
							scaleLabel: {
								display: true,
								labelString: this.param.Units
							}
						}],
						xAxes: [{
							time: {
								unit: 'month'
							},
							scaleLabel: {
								display: true,
								labelString: 'Sample Date'
							}
						}]
					},
					events: ['mousemove', 'mouseout']
				}
			});
			return this.popup;
		}
	}
}
</script>