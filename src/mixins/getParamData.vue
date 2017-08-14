<script>
import moment from 'moment'
import getParamString from './getParamString.js'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {
	data() {
		return {
			csvHeader: '', // builds the first string for the csv file
			csvBody: '', // holds the data for the csv file
			value: '' // the param number passed to the REST functions
		}
	},

	computed: {
		// compute the url from the param number
		url(){
			return 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/TestLayers/MapServer/' + this.value;
		}
	},

	methods: {

		// get well markers as featureLayer
		importParamGeometry(value){
			console.log(value);
			this.value = value;

			this.constituentLayer = esri.featureLayer({
				url: this.url,
				onEachFeature: function(feature, layer){
					return layer.bindPopup(() => {
						return L.Util.template(getParamString(value), feature.properties);
					})
				},
				renderer: L.canvas()  //  can do either L.canvas() or L.svg() (default)
			});
		},

		filterByType(type){
			this.constituentLayer.setWhere("StudyType = '" + type + "'");
		},

		filterByStatus(status){
			console.log(status);
			this.constituentLayer.setWhere("Purpose = '" + status + "'");
		},

		// get well data but not markers
		importParamData(val) {
			var that = this;
			this.value = val;
			var layer = esri.featureLayer({
				url: this.url
			});
			var toReturn = '';
			return layer.query().returnGeometry(false).run((err, fc, res) => {
				toReturn += that.buildHeader(res.fields);
				toReturn += that.buildBody(res.features);
				return toReturn;
			});
			// for(var j = 0; j < arr.length; j++) {
			// 	this.value = arr[j];
			// 	var layer = esri.featureLayer({
			// 		url: this.url
			// 	});
			// 	layer.query().returnGeometry(false).run((err, featureCollection, res) => {
				
			// 		that.csvBody += that.buildHeader(res.fields);
			// 		that.csvBody += that.buildBody(res.features);
			// 		console.log(that.csvBody.length);
			// 		// that.csvBody.concat(that.buildHeader(res.fields), that.buildBody(res.features)); //  build header from field names and concat to csvBody
			// 	});
			// };

	
		},

		buildHeader(arr) {
			// if csvHeader is not yet populated, add all of the values in the array
			if(this.csvHeader.length == 0) {
				console.log('csv header is not populated');
				this.csvHeader = 'data:text/csv;charset=utf-8,';

				for(var i = 0; i < arr.length; i++) {

					// add the name and a comma unless if it's the last entry in the array
					this.csvHeader += i == arr.length - 1 ? arr[i].name : arr[i].name + ', ';
				}

				// start a new line
				this.csvHeader += '\n';
			}
			return this.csvHeader;
		},

		buildBody(arr) {
			console.log('building csv body');
			var toReturn = '';

			for(var i = 0; i<arr.length; i++){

				// change the sample date to a moment.js string
				arr[i].attributes.SampleDate = moment(arr[i].attributes.SampleDate).format('YYYY-MM-DD');

				var attributes = Object.values(arr[i].attributes);

				for(var j = 0; j < attributes.length; j++) {
					attributes[j] = attributes[j] ? attributes[j].toString().replace(/,/g,'') : ''; // delete any commas within string
				}

				// change each array to a string and concat in csvbody. start a new line

				toReturn += attributes.toString()
				toReturn +=  '\n';
			}
			return toReturn;
		}
	}
}
</script>