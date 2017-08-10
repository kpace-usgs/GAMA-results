<script>
import moment from 'moment'
import getParamString from './getParamString.js'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {
	data() {
		return {
			csvHeader: '', // builds the first string for the csv file
			wellArr: [], // holds the data for the csv file
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

		// get well markers
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
				renderer: L.canvas(),  //  can do either L.canvas() or L.svg() (default)
				ignoreRenderer: false
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
		importParamData(value) {
			this.value = value;

			this.constituentLayer = esri.featureLayer({
				url: this.url
			});

			this.constituentLayer.query().returnGeometry(false).run((err, featureCollection, res) => {
				console.log(res)
			});
	
		},

		saveData(obj) {
			// if first feature, add keys to wells array
			// will become header row in csv

			if(this.csvHeader == ''){
				this.csvHeader = Object.keys(obj).slice(1).join(",");
				console.log(this.csvHeader);
				this.wellArr.push(this.csvHeader);
			}
		
			// remove commas from any value strings
			var arrOfValues = Object.values(obj);

			for(var i = 0; i < arrOfValues.length; i++){
				if(typeof(arrOfValues[i]) == 'string'){
					 arrOfValues[i] = arrOfValues[i].replace(/,/g, ' ');
				} 
			}

			// change SampleDate to moment.js string
			arrOfValues[8] = moment(arrOfValues[8]).format('YYYY-MM-DD');
			return this.wellArr.push(arrOfValues.slice(1));
		}
	}
}
</script>