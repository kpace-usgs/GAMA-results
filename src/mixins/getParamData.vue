<script>
import getParamString from './getParamString.js'
import listeners from './addEventListeners.vue'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {
	data() {
		return {
			url: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_2short/MapServer/' 
		}
	},
	mixins: [listeners],

	methods: {
		// get well markers as featureLayer
		importParamGeometry(param){
			var value = param.value;
			var unit = param.units;

			var content = getParamString(param);

			var layer = esri.dynamicMapLayer({
				url: this.url,
				layers: [value]
			}).bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			this.addEventListeners(layer);

			return layer;
		},

		decideHowToFilter(layer, type, value){
			/* filter by whether STATUS or TRENDS, and determine public or domestic by the first two characters of GAMA_ID*/

			// prepare an object that will have a key equal to the parameter value
			var layerNumber = value;
			var obj = {};

			if(type == 1){
				// domestic-supply aquifer sites
				//obj[layerNumber] = "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'";
				layer.setLayerDefs(`{${value}: "Purpose = 'STATUS' AND StudyType = 'Domestic-supply'"}`)
			}

			else if(type == 2){
				// public-supply aquifer sites
				//obj[layerNumber] = "Purpose = 'STATUS' AND StudyType = 'Public-supply'";
				layer.setLayerDefs(`{${value}: "Purpose = 'STATUS' AND StudyType = 'Public-supply'"}`)
			}

			else if(type == 0){
				//obj[layerNumber] = "Purpose = 'TRENDS'"
				layer.setLayerDefs(`{${value}: "Purpose = 'TRENDS'"}`)
			}

			// otherwise don't filter
			else {
				//obj[layerNumber] = "";
				layer.setLayerDefs(`{${value}: ""}`)
			}

			//layer.setLayerDefs(obj);
			console.log(layer.getLayerDefs());
			layer.redraw();
		}
	}
}
</script>