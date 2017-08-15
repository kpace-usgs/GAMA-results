<script>
import moment from 'moment'
import esri from 'esri-leaflet'

export default {
	data() {
		return {
			csvHeader: '', // builds the first string for the csv file
			csvBody: '' // holds the data for the csv file
		}
	},

	watch: {

	},

	methods: {
		importArrayOfValues(arr, callback){
			var that = this;
			// turn loader on
			this.$emit('toggleLoading', true);

			let requests = arr.map( (parameter) => {
				return new Promise((resolve) => {
					that.importParamData(parameter.value, resolve);
				})
			});

			Promise.all(requests).then(() => {
				// what to do when all done
				console.log('all done');
				this.$emit('toggleLoading', false);
				return callback();
			});
		},
		// menu passes an array of values for which we want to get data to be put in csv format, don't need geometry
		importParamData(val, resolve) {
			this.value = val;
			var layer = esri.featureLayer({
				url: this.url // this.url calculated in getParamData.vue mixin
			});

			// filter the layer by type and by status
			// type and status values saved in state
			if(this.type != ''){
				this.decideHowToFilter(layer);
			}
			
			var that = this;
			/* query layer and build csv from response */
			layer.query().returnGeometry(false).run((err, fc, res) => {
				/* concat any header that gets returned and the body built from the features */
				that.csvBody += that.buildHeader(res.fields);
				that.csvBody += that.buildBody(res.features);
				console.log(that.csvBody.length);
				return resolve(); //must call the resolve or else Promise.all() never thinks the queries are finished
			});
		},

		buildHeader(arr) {

			/* if csvHeader is not yet populated, add all of the values in the array */
			if(this.csvHeader.length == 0) {
				console.log('csv header is not populated');
				this.csvHeader = 'data:text/csv;charset=utf-8,';

				for(var i = 0; i < arr.length; i++) {

					// add the name and a comma unless if it's the last entry in the array
					this.csvHeader += i == arr.length - 1 ? arr[i].name : arr[i].name + ', ';
				}

				// start a new line
				this.csvHeader += '\n';
				return this.csvHeader;
			}
			// otherwise don't return anything to be added to csvBody
			return;
		},

		buildBody(arr) {
			console.log('building csv body');
			var stringToReturn = '';

			for(var i = 0; i < arr.length; i++){
				// change the sample date to a moment.js string
				arr[i].attributes.SampleDate = moment(arr[i].attributes.SampleDate).format('YYYY-MM-DD');

				var attributes = Object.values(arr[i].attributes);

				for(var j = 0; j < attributes.length; j++) {
					attributes[j] = attributes[j] ? attributes[j].toString().replace(/,/g,'') : ''; // delete any commas within string
				}

				// change each array to a string and concat in csvbody. start a new line
				stringToReturn += attributes.toString()
				stringToReturn +=  '\n';
			}
			console.log(stringToReturn.slice(0, 400));

			return stringToReturn;
		}
	}
}
</script>