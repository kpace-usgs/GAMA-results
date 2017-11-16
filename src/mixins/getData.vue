<script>
/* import functions that will be used to construct popups and map layers*/
import esri from 'esri-leaflet';
import buildDef from './buildDefs.js'

export default {
	/* store all the urls where data are queried for map. all GAMA data are on AllGAMAData map server, all base layers and legend info are on SitesLayersLegend map server*/
	data(){
		return {
			urlForData: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/WQR_WebMap_Data/MapServer',
	
			urlForPolygon: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/SitesLayersLegend/MapServer'
		}
	},

	methods: {
		/* build point layer of wells by pcode. return a function that returns a layer */
		buildData(callback){
			this.$emit('toggleLoading', true);


			console.log('building data')
			var url = this.urlForData; // pick which url endpoint will be used

			var defs = buildDef(this.type, this.param.PCODE); // get a layer definition based on type, and param.PCODE
			console.log(defs);

			// create esri-leaflet find object
			// var data = this.getTable(url);
			// data.layer(0)
			// data.limit(100)
			// data.where(defs);

			var data = this.getData(url).layers('0').layerDefs(0, defs).fields('PCode').text(this.param.PCODE);

			var that = this;
			/* run query and return the resulting feature collection */
			data.run( (err, fc) => {
				console.log('running')
				if(err){ console.log(err); that.$emit('toggleLoading', false)}
					console.log('number of features: ' + fc.features.length);
				that.fc = fc;
				callback(fc);
			});
		},

		/* build point layer of wells by type */
		buildLayer(type) {

			console.log('getting layer: ' + type + ' from SitesLayersLegend service');
			/* get layer and return */
			var layer = this.getLayer(type, this.layerDef);

			/* bind popup. the arguments are different than those for bindPopup function in the mapDiv because this is an esri dynamic map layer whereas those are leaflet geojsons. the functions to bind popups are slightly different */
			layer.bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + featureCollection.features[0].properties.StudyType;
				}
			});
	
			return layer.bringToBack();
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
	
		layerValue() {
			// because there are only 3 layers that show wells by type, both type == 4 and type === 0 are actually getting the layer number 0 (trends)
			return this.type == 4 ? 0 : this.type;
		},

		layerDef(){
			/* layer definition for dynamicMapLayer well type points */
			console.log('filtering by type: ' + this.type);

			var value = this.layerValue;
			// only need to filter if a trends type has been chosen. 

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
		},

		typeString() {

			switch(this.type) {
				case '0':
					return "Public-supply Trends Sites"
					break;
				case '1':
					return 'Domestic-supply Aquifer Sites'
					break;
				case '2': 
					return 'Public-supply Aquifer Sites'
					break;
				case '4': 
					return 'Domestic-supply Trends Sites'
					break;
				default:
					return '';
			};
		}
	}
}
</script>