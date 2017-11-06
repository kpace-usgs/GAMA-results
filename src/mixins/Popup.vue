<script>
import moment from 'moment';
import Chart from 'chart.js';

/* must be a mixin to a component that has state values for param and threshIndex */
export default {
	name: 'getTrendPopup',
	data(){
		return {
			chartData: [],
			canvas: document.createElement('canvas'),
			popup: document.createElement('div'),
			chart: '',
			popupProperties: ''
		}
	},

	computed: {
		category() {
			// if no value for the category's column has been provided, return 'Category'. If a blank string has been provided for the value, return 'N/A'
			return this.param.hasOwnProperty('statusColumns') ? this.param.statusColumns.category == '' ? 'N/A' : this.param.statusColumns.category : '{Category}'
		},

		lookFor() {
			return this.param.units === 'Number of Detections' ? this.param.units : this.param.name === 'pH' ? this.param.name : 'Concentration'
		},

		column() {
			return this.param.hasOwnProperty('statusColumns') ? this.param.statusColumns.column : 'Concentration'
		},

		units(){
			return this.param.units === 'Number of Detections' ? '' : `(${this.param.units})`; //don't show if a number of detections constituent
		},

		trendsLength(){
			return this.param.trends.length;
		},

		backgroundColors(){
			return Array(this.chartData.length).fill().map((item, i) => {
				return i === this.trendIndex ? '#896FC3'  : '#CCC5CE' ;
			});
		}
	},

	watch: {
		trendIndex(){
			// watch for change in trend index and if there's a chart attached to this.chart value, change the array of colors
			if(this.chart.hasOwnProperty('data') && this.trendIndex !== ''){
				this.chart.data.datasets[0].pointBackgroundColor = this.backgroundColors;
				this.chart.update();
				this.popup.innerHTML = ''; //clear
				var properties = this.chartData[this.trendIndex].properties;
				if(properties.hasOwnProperty('StudyUnit')){
					this.popup.insertAdjacentHTML('beforeend', this.returnString(properties) + `<br/>Study Unit Trend Visit: ${properties.VisitNo}</p>`); //add additional line
				}
				else {
					this.popup.insertAdjacentHTML('beforeend', `<p>Study Unit: ${this.popupProperties.StudyUnit}<br/>GAMA ID: ${this.popupProperties.GAMA_ID}<br/>Sample Date: Not sampled in this visit<br/>${this.lookFor}: N/A ${this.units}<br/>Category: N/A<br/>Study Unit Trend Visit: ${this.trendIndex + 1}</p>`)
				}
				
				this.popup.insertAdjacentElement('beforeend', this.canvas);
			}
		}
	},

	methods: {
		returnParamPopup(properties) {
			this.popup.innerHTML = ''; //clear popup
			this.popup.insertAdjacentHTML('beforeend', this.returnString(properties));
			this.popup.insertAdjacentHTML('beforeend', '</p>');
			return this.popup;
		},

		returnString(properties){
			var date = moment(properties.SampleDate).format('MM/DD/YYYY');
			var lookFor = properties[this.column];

			return `<p>Study Unit: ${properties.StudyUnit}<br/>\
			GAMA ID: ${properties.GAMA_ID}<br/>\
			Sample Date: ${date}<br/>\
			${this.lookFor}: ${lookFor} ${this.units}<br/>\
			Category: ${this.category}`
		},

		returnTrendPopup(properties, esriObj){
			this.popup.innerHTML = ''; //clear popup
			this.canvas.innerHTML = ''; //clear canvas
			this.popupProperties = properties;
			this.chartData = []; //clear array
			this.popup.insertAdjacentHTML('beforeend', this.returnString(properties) + `<br/>Study Unit Trend Visit: ${properties.VisitNo}</p>`); //add additional line
			this.popup.insertAdjacentElement('beforeend', this.canvas);
			return this.buildGraph(properties.GAMA_ID, esriObj);
		},

		/* run the esri find object for rows where GAMA_ID = gamaID */
		buildGraph(gamaID, esriObj) {
			esriObj.text(gamaID).fields("GAMA_ID");

			for(var i = 0; i < this.param.trends.length; i++){
				var val = this.param.trends[i];
				esriObj.layers(val);
				this.runFind(esriObj, i); //run esri find object

				// when done, return popup
				if(i === this.param.trends.length - 1){
					return this.popup;
				}
			}
		},

		runFind(find, i){

			return find.run( (err, fc) => {
				if(err) {
					return; //catch error
				}
				// if a layer exists for the param.value at the given trend, push data to arrays
				var hasResults = fc.features.length > 0;

				console.log(fc);

				this.chartData.push({
					index: i,
					label: hasResults ? fc.features[0].properties.SampleDate : 'NA',
					data: hasResults ? fc.features[0].properties[this.column] : null,
					properties: hasResults ? fc.features[0].properties: {}
				});

				/* hack of a callback */
				if(this.chartData.length === this.trendsLength){
					this.chartData.sort(this.compare);
					return this.createChart(this.trendIndex); //this.trendIndex is received as a prop by mapDiv.vue
				}
			});
		},

		createChart(index) {
			/* declare variables used by chart from chartData array*/
			function createFromArr(arr, key) {
				return arr.map((dataPoint, i) => {return dataPoint[key]})
			};
			var labels = createFromArr(this.chartData, 'label');
			var data = createFromArr(this.chartData, 'data');
			var hoverColors = Array(this.chartData.length).fill().map(() => { '#896FC3' });

			// build graph from the array
			var graph = this.canvas.getContext('2d')
			this.chart = new Chart(graph, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [{
						data: data,
						pointBackgroundColor: this.backgroundColors,
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
								suggestedMax: 4,
								max: this.tresh,
								stepSize: 1
							},
							scaleLabel: {
								display: true,
								labelString: this.param.units
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
					}
				}
			});
			return this.popup;
		},

		compare(a, b){
			/* function to order results by their trend order, since call to arcserver is async and results may not be returned in order */
			if(a.index < b.index) {
				return -1;
			} else if( a.index > b.index) {
				return 1;
			}
			return 0;
		}
	}
}
</script>