<script>
/* import functions that will be used to construct popups and map layers*/
import getParamPopup from './getParamPopup.js'
import getTrendPopup from './getTrendPopup.js'
import buildTrendGraph from './buildTrendGraph.js'
import listeners from './addEventListeners.vue'
import * as esriFunctions from './esriFunctions.js'

export default {

	data(){
		return {
			urlForParamData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_symbolsordered/MapServer/',
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/trends_layers_thresholds/MapServer/',
			urlForPolygonData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/base/MapServer/',
			urlForTypeData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/sites2/MapServer/'
		}
	},
	mixins: [listeners],

	methods: {

		importTrend(){
			// save values to be passed to popup
			var content = getTrendPopup(this.param);
			var url = this.urlForTrendData;

			// get layer
			var defs = this.decideHowToFilter(this.type, this.trend);
			var layer = esriFunctions.getLayer(defs, url, this.trend);

			/* bind a popup that includes the info about that well, plus that well's trend graph */
			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					this.getTrendsForGraph(properties.GAMA_ID, content.column, url);

					return L.Util.template(content.string(properties), properties)  
				}
			});

			this.addEventListeners(layer);

			return layer;
		},

		getTrendsForGraph(gamaID, column, url){
			var trendsLength = this.param.trends.length;
			/* use esri-leaflet find function */
			var layer = esriFunctions.getData(url);

			layer.text(gamaID).fields("GAMA_ID").returnGeometry(true); //shared settings

			return buildTrendGraph(layer, trendsLength, column, this.param); //buildTrendGraph.js
		},
		// get well markers as featureLayer
		importParam(){
			/* use the param data available in the component that has registered this file as a mixin */

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(this.type, this.param.value);

			var content = getParamPopup(this.param);

			var layer = esriFunctions.getLayer(defs, this.urlForParamData, this.param.value);

			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			this.addEventListeners(layer);

			return layer;
		},

		importPaneJson(val) {
			var layer = esriFunctions.getPane(this.urlForPolygonData, val)

			this.addEventListeners(layer);

			return layer;			
		},

		importTypeJson(val) {
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
			var layerValue = val === '4' ? 0: val;

			var defs = this.decideHowToFilter(filterType, layerValue);

			/* get layer and return */
			var layer = esriFunctions.getLayer(defs, this.urlForTypeData, layerValue);
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

		decideHowToFilter(type, value){
			/* if this.type == 1 or 2, the layer is from ParamData and must be filtered by StudyType and Purpose. If this.type === 0 or 4, the layer is from TrendsData. The type value determines studyType but the purpose is determined by the index of the trends array (if we're looking at t0 or t1)*/
			console.log('filtering by type: '+ type)
			if(type === 1 || type === "1"){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			}

			else if(type === 2 || type === "2"){
				return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			}

			else if(type === 0 || type === "0"){
				return `{${value}: "StudyType = 'Public-supply'"}`
			}

			else if(type === 4 || type === '4'){
				return `{${value}: "StudyType = 'Domestic-supply'"}`
			}

			// otherwise don't filter; return all entries
			else {
				return `{${value}: ""}`
			}
		}
	}
}
</script>