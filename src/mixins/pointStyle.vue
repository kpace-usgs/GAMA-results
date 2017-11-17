<script>
export default {
	name: 'pointStyle',

	computed: {

		// save the symbology colors for each entry in the selected parameter's legend array
		color_low(){
			return this.param.Legend.find(item => {
				return item.LegendItem == 3
			}).Color;
		},

		color_med() {
			return this.param.Legend.find(item => {
				return item.LegendItem == 2;
			}).Color;
		},

		color_high() {
			var hex = this.param.Legend.find(item => {
				return item.LegendItem == 1;
			}).Color;

			console.log(hex);
			return hex;
		}
	},
	methods: {
		pointStyle(feature, latlng) {
			return L.circleMarker(latlng, {
				fillColor: `#${this.color(feature)}`,
				fillOpacity: 1,
				weight: 0.5,
				opacity: 1,
				color: 'black',
				radius: 4,
				zIndexOffset: 40
			});
		},

		color(feature, param) {
			var result = parseInt(feature.properties.LabValue);
			var thresh_low = this.param.Threshold_low ? parseInt(this.param.Threshold_Low) : parseInt(this.param.Legend[this.param.LegendCount - 1].Category); //e.g. 1 Detect Count
			var thresh_hi = this.param.Threshold_Hi ? parseInt(this.param.Threshold_Hi) : parseInt(this.param.Legend[0].Category.slice(-1));


			if( result > thresh_hi) {
				return this.color_high
			}
			else if (result > thresh_low) {
				return this.color_med
			}
			else if(result == 0) {
				return 'none'
			}
			else {
				return this.color_low
			}
		}
	}
};
</script>