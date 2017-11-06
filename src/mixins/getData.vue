<script>
/* import functions that will be used to construct popups and map layers*/
import Popup from './Popup.vue';
import listeners from './addEventListeners.vue'
import * as esriFunctions from './esriFunctions.js'

export default {

	data(){
		return {
			urlForParamData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_symbolsordered/MapServer/',
			urlForTrendView: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/trends_layers_thresholds/MapServer/',
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/data/MapServer/',
			urlForPolygonData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/base/MapServer/',
			urlForTypeData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/sites2/MapServer/'
		}
	},
	mixins: [listeners, Popup],

	methods: {

		importTrend(type, trend){

			// get layer
			var defs = this.decideHowToFilter(type, trend);
			var layer = esriFunctions.getLayer(defs, this.urlForTrendView, trend);

			// get data for popup. layer number is set by parameter group key value
			var esriObj = esriFunctions.getData(this.urlForTrendData);

			/* save functions from TrendPopup.vue mixin as local variables so the popup can access them */
			var popup = this.returnTrendPopup;

			/* bind a popup that includes the info about that well, plus that well's trend graph */
			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return popup(properties, esriObj);
				}
			});

			this.addEventListeners(layer);

			return layer;
		},

		// get well markers as featureLayer
		importParam(){
			/* use the param data available in the component that has registered this file as a mixin */

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(this.type, this.param.value);
			var layer = esriFunctions.getLayer(defs, this.urlForParamData, this.param.value);
			var popup = this.returnParamPopup;

			layer.bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return popup(properties);
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