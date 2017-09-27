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
			return 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/layers/MapServer/' + this.value;
		}
	},

	methods: {
		// get well markers as featureLayer
		importParamGeometry(value){
			console.log(value);
			this.value = value;
			var content = getParamString(value);

			return esri.featureLayer({
				url: this.url,
				onEachFeature: function(feature, layer){ 
					return layer.bindPopup(() => {
						return L.Util.template(content.string(feature.properties), feature.properties);
						//return L.Util.template(getParamString(value, feature.properties), feature.properties);
					})
				},
				where: `${content.column} IS NOT NULL` ,
				renderer: L.canvas()  //  can do either L.canvas() or L.svg() (default)
			});
		},

		decideHowToFilter(layer){
			/* filter by whether STATUS or TRENDS, and determine public or domestic by the first two characters of GAMA_ID*/
			if(this.type == 2 || this.type == 3){
				if(this.type == 2){
					return layer.setWhere("Purpose = 'STATUS' AND GAMA_ID LIKE 'S-%'")
				} else {
					return layer.setWhere("Purpose = 'STATUS' AND NOT GAMA_ID LIKE 'S-%'")
				}
			} 

			else if(this.type == 1 || this.type == 4){
				if(this.type == 1) {
					return layer.setWhere("Purpose = 'TRENDS' AND GAMA_ID LIKE 'S-%'");
				} else {
					return layer.setWhere("Purpose = 'TRENDS' AND NOT GAMA_ID LIKE 'S-%'")
				}
				
			}

			/* if all sites selected, don't filter*/
			else {
				 return;
				// return layer.setWhere("Purpose = '" + this.studyType + "'");
			}

			layer.redraw();
		}
	}
}
</script>