<script>
import getParamString from './getParamString.js'
import listeners from './addEventListeners.vue'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {

	mixins: [listeners],

	methods: {
		// get well markers as featureLayer
		importParamGeometry(param, type){
			var value = param.value;

			var unit = param.units;
			var defs = this.decideHowToFilter(type, value);
			var content = getParamString(param);

			var layer = esri.dynamicMapLayer({
				url: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers2short/MapServer/',
				layers: [value],
				layerDefs: defs
			}).bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			this.addEventListeners(layer);

			return layer;
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