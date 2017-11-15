<script>
/* import functions that will be used to construct popups and map layers*/
import Popup from './Popup.vue';
import listeners from './addEventListeners.vue'
import * as esriFunctions from './esriFunctions.js'

export default {
	/* store all the urls where data are queried for map. all GAMA data are on AllGAMAData map server, all base layers and legend info are on SitesLayersLegend map server*/
	data(){
		return {
			urlForParamData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/AllGAMAData/MapServer',
			urlForTrendData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/AllGAMAData/MapServer',
			urlForPolygonData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/SitesLayersLegend/MapServer',
			urlForTypeData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/SitesLayersLegend/MapServer'
		}
	},
	mixins: [listeners, Popup],

	methods: {

		importTrend(type, trend){
			var url = this.urlForTrendData; // pick which url endpoint will be used

			var defs = this.decideHowToFilter(type, trend); // get a layer definition based on type and trend selections 

			var layer = esriFunctions.getLayer(defs, url, trend); //get layer for map
			var esriObj = esriFunctions.getData(url); // get data for popup


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
		importParam(type, val){
			/* use the param data available in the component that has registered this file as a mixin */

			/* filter by state's type and param.value */
			var defs = this.decideHowToFilter(type, val);
			var layer = esriFunctions.getLayer(defs, this.urlForParamData, val);
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
			// because there are only 3 layers in the TypeJson service, both val == 4 and val === 0 are actually getting the layer val === 0
			var layerValue = val === '4' ? 0: val;

			// only need to filter if a trends type has been chosen. otherwise, this.filterType returns "" and this.decideHowToFilter returns an empty layer def. all records for the layerValue will be returned.
			var defs = this.decideHowToFilter(this.filterType, layerValue);

			/* get layer and return */
			var layer = esriFunctions.getLayer(defs, this.urlForTypeData, layerValue);
			layer.bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + featureCollection.features[0].properties.StudyType + ' ' + featureCollection.features[0].properties.Purpose;
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
	},

	computed: {
		filterType(){
			/* if a trends type has been selected, then the imported layer will need to be filtered by type since there's only one trends layer; otherwise, the query has already been done so we don't need to filter again and we can return just an empty "". */
			switch(this.type){
				case '0':
					return 0
					break;
				case '4': 
					return 4
					break;
				default:	
					return ""
			}
		}
	}
}
</script>