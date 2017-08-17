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
			return 'https://arcgis.wr.usgs.gov:6443/arcgis/rest/services/TestLayers/MapServer/' + this.value;
		},

		studyType(){
			// used to filter wells returned from parameter value
			switch(this.type){
				case '0':
					return 'STATUS'
					break;
				case '1':
					return 'TRENDS'
					break;
				case '2': 
					return 'Domestic-supply' 
					//have to change value because geojson property is recorded as 'domestic-supply' instead of 'shallow'
					break;
				case '3':
					return 'Public-supply'
					break;
				default:
					return this.type;
			}
		}
	},

	methods: {

		// get well markers as featureLayer
		importParamGeometry(value){
			console.log(value);
			this.value = value;

			let layerDetails = getParamString(value);

			return esri.featureLayer({
				url: this.url,
				onEachFeature: function(feature, layer){

					return layer.bindPopup(() => {
						
						return L.Util.template(`<p>Study Unit: {StudyUnit}<br/>GAMA ID: {GAMA_ID}<br/>Category: {${layerDetails.category}}<br/>${layerDetails.lookFor}: {${layerDetails.value}}</p>`, feature.properties);
						//return L.Util.template(getParamString(value), feature.properties);
					})
				},
				where: `${layerDetails.value} IS NOT NULL` ,
				renderer: L.canvas()  //  can do either L.canvas() or L.svg() (default)
			});
		},

		decideHowToFilter(layer){
			/* if either public or domestic type selected, filter by type */
			if(this.type != 0 && this.type != 1){
				// this.studyType is computed in getParamData.vue
				return layer.setWhere("StudyType = '" + this.studyType + "'");
			} 

			/* if either all sites or trends sites selected, filter by status */
			else {
				console.log('filter by status');
				return layer.setWhere("Purpose = '" + this.studyType + "'");
			}

			layer.redraw();
		}
	}
}
</script>