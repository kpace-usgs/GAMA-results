<script>
/* getParamString considers what keys the parameter has been givin in listOfParameters.json and returns the appropriate string for the popup */
import getParamString from './getParamString.js'
import getTrendString from './getTrendString.js'
import listeners from './addEventListeners.vue'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {

	data(){
		return {
			urlForParamData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_symbolsordered/MapServer/',
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/trends_layers/MapServer/',
			urlForPolygonData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/base/MapServer/',
			urlForTypeData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/sites2/MapServer/'
		}
	},
	mixins: [listeners],

	methods: {
		getLayer(defs, url, value){
			/* request dynamic map layer from esri according to which url value has been set to this.url. this.type lives in whatever component this is registered as a mixin (for this project, the mapDiv.vue component) */
			/* import data and bind popup */
			var layer = esri.dynamicMapLayer({
				url: url,
				layers: [value],
				layerDefs: defs
			});

			this.addEventListeners(layer);

			/* return layer */
			return layer;
		},
		importTrend(){
			/* use the trend data available in the component that has registered this file as a mixin */
			var content = getTrendString(this.param);

			var defs = this.decideHowToFilter(this.type, this.trend);
			var layer = this.getLayer(defs, this.urlForTrendData, this.trend);

			/* bind a popup that includes the info about that well, plus that well's trend graph */
			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties) + this.buildTrendGraph(properties.GAMA_ID)
				}
			});

			// TODO add trends graph to popup. can you bind multiple L.Util.templates?

			return layer;
		},
		// get well markers as featureLayer
		importParam(){
			/* use the param data available in the component that has registered this file as a mixin */

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(this.type, this.param.value);

			var content = getParamString(this.param);

			var layer = this.getLayer(defs, this.urlForParamData, this.param.value);

			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			return layer;
		},

		decideHowToFilter(type, value){
			/* if this.type == 1 or 2, the layer is from ParamData and must be filtered by StudyType and Purpose. If this.type === 0 or 4, the layer is from TrendsData. The type value determines studyType but the purpose is determined by the index of the trends array (if we're looking at t0 or t1)*/
			console.log('filtering by type: '+ type)
			if(type == 1){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			}

			else if(type === 2 || type === "2"){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			}

			else if(type === 0 || type === "0"){
				return `{${value}: "StudyType = 'Public-supply'"}`
			}

			else if(type == 4){
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

			/* for all study types and all status types, don't filter, but for either trends type, do filter*/
			var filterType;
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
			this.layerValue = val === '4' ? 0: val;

			var defs = this.decideHowToFilter(filterType, this.layerValue);

			this.urlToUse = this.urlForTypeData;

			var layer = this.getLayer(defs);

			layer.bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + getType(featureCollection.features[0]);
				}
			});

			this.addEventListeners(layer);

			return layer;
		},

		buildTrendGraph(gamaID){
			var div = document.createElement('div');

		}
	}
}
</script>