<script>
import getParamString from './getParamString.js'
import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

export default {
	data() {
		return {
			value: '' // the param number passed to the REST functions
		}
	},

	computed: {
		// compute the url from the param number
		url(){
			return 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/layers_symbolsordered/MapServer/' 
		}
	},

	methods: {
		// get well markers as featureLayer
		importParamGeometry(value, unit){
			console.log(value);
			this.value = value;
			var content = getParamString(value, unit);

			return esri.dynamicMapLayer({
				url: this.url,
				layers: [this.value]
			}).bindPopup( (err, fc) => {
				for(var i = 0; i < fc.features.length; i++){
					var properties = fc.features[i].properties;
					return L.Util.template(content.string(properties), properties)
				}
			});

			// return esri.featureLayer({
			// 	url: this.url,
			// 	onEachFeature: function(feature, layer){ 
			// 		return layer.bindPopup(() => {
			// 			return L.Util.template(content.string(feature.properties), feature.properties);
			// 			//return L.Util.template(getParamString(value, feature.properties), feature.properties);
			// 		})
			// 	},
			// 	where: `${content.column} IS NOT NULL` ,
			// 	renderer: L.canvas()  //  can do either L.canvas() or L.svg() (default)
			// });
		},

		decideHowToFilter(layer){
			/* filter by whether STATUS or TRENDS, and determine public or domestic by the first two characters of GAMA_ID*/

			// prepare an object that will have a key equal to the parameter value
			var layerNumber = this.value;
			var obj = {};

			if(this.type == 2 || this.type == 3){
				if(this.type == 2){
					obj[layerNumber] = "Purpose = 'STATUS' AND StudyUnit LIKE 'S_\_%'";
					return layer.setLayerDefs(obj);
					//return layer.setWhere("Purpose = 'STATUS' AND GAMA_ID LIKE 'S-%'")
				} else {
					obj[layerNumber] = "Purpose = 'STATUS' AND NOT StudyUnit LIKE 'S_\_%'";
					return layer.setLayerDefs(obj);
					//return layer.setWhere("Purpose = 'STATUS' AND NOT GAMA_ID LIKE 'S-%'")
				}
			} 

			else if(this.type == 1 || this.type == 4){
				if(this.type == 1) {
					obj[layerNumber] = "Purpose = 'TRENDS' AND StudyUnit LIKE 'S_\_%'";
					return layer.setLayerDefs(obj);
					//return layer.setWhere("Purpose = 'TRENDS' AND GAMA_ID LIKE 'S-%'");
				} else {
					obj[layerNumber] = "Purpose = 'TRENDS' AND NOT StudyUnit LIKE 'S_\_%'";
					return layer.setLayerDefs(obj);
					//return layer.setWhere("Purpose = 'TRENDS' AND NOT GAMA_ID LIKE 'S-%'")
				}
				
			}

			/* if all sites selected, remove all filters*/
			else {
				obj[layerNumber] = "";
				return layer.setLayerDefs(obj);
				//return layer.setWhere("Purpose LIKE '%'");
			}

			layer.redraw();
		}
	}
}
</script>