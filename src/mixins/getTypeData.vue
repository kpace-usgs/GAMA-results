<script>
import esri from 'esri-leaflet'
import listeners from './addEventListeners.vue'

export default {
	data() {
		return {
			url: 'https://igswcawwwb1301.wr.usgs.gov:6443/arcgis/rest/services/sites2/MapServer/'
		}
	},

	mixins: [listeners],
	
	methods: {

		importTypeJson(layer, type){
			/* get well sites by type of well: public supply, domestic, trends, or all both */
			var layer = esri.dynamicMapLayer({
				url: this.url,
				layers: [layer],
				position: type == 1 ? 'front' : type == 2 ? 'back' : 'front'
			}).bindPopup( (err, featureCollection) => {
				if(err || featureCollection.features.length === 0) {
					return false;
				} else {
					return 'Well type: ' + getType(featureCollection.features[0]);
				}
			});

			this.addEventListeners(layer);

			return layer;
		
		},
	}
}
</script>