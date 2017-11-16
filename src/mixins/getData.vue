<script>
/* import functions that will be used to construct popups and map layers*/
import esri from 'esri-leaflet';
import buildDef from './buildDefs.js'

export default {
	/* store all the urls where data are queried for map. all GAMA data are on AllGAMAData map server, all base layers and legend info are on SitesLayersLegend map server*/
	data(){
		return {
			urlForData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/AllGAMAData/MapServer',
	
			urlForPolygon: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/SitesLayersLegend/MapServer'
		}
	},

	methods: {
		/* build point layer of wells by pcode */
		buildData(type, code){
			var url = this.urlForData; // pick which url endpoint will be used

			var defs = buildDef(type, code); // get a layer definition based on type, param.PCODE, and trendIndex selections 

			var data = this.getTable(url).layer('0').where(def); //get layer for map

			var featureCollection; //create variable

			/* run query and return the resulting feature collection */
			data.run( (err, fc) => {
				if(err){ console.log(err) }
				console.log(fc);
				featureCollection = fc;
			});

			return featureCollection;
		},

		/* build point layer of wells by type */
		buildLayer(type) {
			console.log('getting layer: ' + this.layerValue + ' from SitesLayersLegend service');
			/* get layer and return */
			var layer = this.getLayer(this.layerValue, this.layerDef);

			/* bind popup. the arguments are different than those for bindPopup function in the mapDiv because this is an esri dynamic map layer whereas those are leaflet geojsons. the functions to bind popups are slightly different */
			layer.bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + featureCollection.features[0].properties.StudyType;
				}
			});
	
			return layer;
		},

		getData(url){
			return esri.find({
				url: url
			});
		},

		getTable(url) {
			return esri.query({
				url: url
			});
		},

		getLayer(layer, def) {
			var url = this.urlForPolygon;

			return esri.dynamicMapLayer({
				url: url,
				layers: [layer],
				layerDefs: def
			});
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
		},

		layerValue() {
			// because there are only 3 layers that show wells by type, both type == 4 and type === 0 are actually getting the layer number 0 (trends)
			return this.type == 4 ? 0 : this.type;
		},

		layerDef(){
			/* layer definition for dynamicMapLayer well type points */
			console.log('filtering by type: ' + this.type);

			var value = this.layerValue;
			// only need to filter if a trends type has been chosen. otherwise, this.filterType returns "" and this.decideHowToFilter returns an empty layer def. all records for the layerValue will be returned.
			
			// if(this.type === 1 || type === "1"){
			// 	return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`
			// }

			// else if(type === 2 || type === "2"){
			// 	return `{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`
			// }

			if(this.type === 0 || this.type === "0"){
				return `{${value}: "StudyType = 'Public-supply'"}`
			}

			else if(this.type === 4 || this.type === '4'){
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