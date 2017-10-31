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

			var defs = this.decideHowToFilter(this.type, this.trend);
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
			/* if this.type == 1 or 2, the layer is from ParamData and must be filtered by StudyType and Purpose. If this.type === 0 or 4, the layer is from TrendsData. The type value determines studyType but the purpose is determined by the index of the trends array (if we're looking at t0 or t1)*/
			if(type == 1){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			}

			else if(type === 2){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			}

			else if(type === 0){
				return `{${value}: "StudyType = 'Public-supply'"}`
			}

			else if(type === 4){
				return `{${value}: "StudyType = 'Domestic-supply'"}`
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
			console.log('import type json');

			var filterType;

			console.log('type is: ' + this.type);

			switch(this.type){
				case '0':
					filterType = 0
					break;
				case '4': 
					filterType = 4
					break;
				default:	
					filterType = ""
			}

			console.log('filter type is: ' + filterType);
			// because there are only 3 layers in the TypeJson service, both val == 4 and val === 0 are actually getting the layer val === 0
			var queryVal = val === '4' ? 0: val;

			var defs = this.decideHowToFilter(filterType, queryVal)

			var layer = esri.dynamicMapLayer({
				url: this.urlForTypeData,
				layers: [queryVal],
				layerDefs: defs,
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