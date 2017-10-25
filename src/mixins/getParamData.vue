<script>
import getParamString from './getParamString.js'
import listeners from './addEventListeners.vue'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {

	data(){
		return {
			urlToUse: '',
			layerValue: '',
			urlForParamData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_symbolsordered/MapServer/',
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/trends_layers/MapServer/'
		}
	},
	mixins: [listeners],

	methods: {
		getLayer(defs){
			/* request dynamic map layer from esri according to which url value has been set to this.url. this.type lives in whatever component this is registered as a mixin (for this project, the mapDiv.vue component) */
			var url = this.urlToUse;
			var value = this.layerValue;
			var unit = this.param.units;
			var content = getParamString(this.param);
	
			/* import data and bind popup */
			var layer = esri.dynamicMapLayer({
				url: url,
				layers: [value],
				layerDefs: defs
			}).bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			this.addEventListeners(layer);

			/* return layer */
			return layer;
		},
		importTrend(){
			this.layerValue = this.trend;
			this.urlToUse = this.urlForTrendData;

			/* filter with a value of 10 for this.type so that results will not be filtered by public/domestic since all trends wells are public */
			var defs = this.decideHowToFilter(10, this.trend);
			return this.getLayer(defs);
		},
		// get well markers as featureLayer
		importParam(){
			this.layerValue = this.param.value
			this.urlToUse = this.urlForParamData;

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(this.type, this.param.value)
			return this.getLayer(defs);
		},

		decideHowToFilter(type, value){
			/* filter by whether STATUS or TRENDS, and determine public or domestic by the first two characters of GAMA_ID*/

			if(type == 1){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			}

			else if(type === 2){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			}

			else if(type === 0){
				return `{${value}: "Purpose = 'TRENDS'"}`
			}

			// otherwise don't filter
			else {
				return `{${value}: ""}`
			}
		}
	}
}
</script>