<script>
/* getParamString considers what keys the parameter has been givin in listOfParameters.json and returns the appropriate string for the popup */
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
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/trends_layers/MapServer/',
			urlForPolygonData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/base/MapServer/',
			urlForTypeData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/sites2/MapServer/'
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
			/* use the trend data available in the component that has registered this file as a mixin */
			this.layerValue = this.trend;
			this.urlToUse = this.urlForTrendData;

			/* filter with a value of 10 for this.type so that results will not be filtered by public/domestic since all trends wells are public. does not need to be 10, just needs to not be 0, 1, or 2 */
			var defs = this.decideHowToFilter(10, this.trend);
			return this.getLayer(defs);
		},
		// get well markers as featureLayer
		importParam(){
			/* use the param data available in the component that has registered this file as a mixin */
			this.layerValue = this.param.value
			this.urlToUse = this.urlForParamData;

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(this.type, this.param.value)
			return this.getLayer(defs);
		},

		decideHowToFilter(type, value){
			/* filter by whether STATUS or TRENDS, and determine public or domestic by the StudyType column*/

			/*TODO: when user selects type == "all trends", instead of getting param layer, just get t1 layer and don't filter */

			/*TODO: when user selects type=='all domestic' or type == 'all public', just get t0 layer and filter only by StudyType*/

			if(type == 1){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			}

			else if(type === 2){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			}

			else if(type === 0){
				return `{${value}: "Purpose = 'TRENDS'"}`
			}

			// otherwise don't filter; return all entries
			else {
				return `{${value}: ""}`
			}
		},

		importPaneJson(val) {
			var layer = esri.dynamicMapLayer({
				url: this.urlForPolygonData,
				layers: [val],
				minZoom: 4,
				position: val == 4 ? 'back' : 'front'
			});

			this.addEventListeners(layer);

			return layer;			
		},

		importTypeJson(val) {
			console.log('import type json')
			var layer = esri.dynamicMapLayer({
				url: this.urlForTypeData,
				layers: [val],
				position: this.type == 1 ? 'front' : this.type == 2 ? 'back' : 'front'
			}).bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + getType(featureCollection.features[0]);
				}
			});

			this.addEventListeners(layer);

			return layer;
		}
	}
}
</script>