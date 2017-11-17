<script>
export default {
	name: 'pointStyle',

	computed: {

		// save the symbology colors for each entry in the selected parameter's legend array
		color_low(){
			return this.param.Legend.find(item => {
				return item.LegendItem == this.param.LegendCount; //find the final item
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
			return hex;
		},

		thresh_low(){
			return this.param.Threshold_Low ? parseFloat(this.param.Threshold_Low) : parseInt(this.param.Legend[this.param.LegendCount - 1].Category);  // this still isn't great for Carbon-14 where no Threshold_Low is given but also shouldn't be using Category
		},

		thresh_high() {
			return this.param.Threshold_Hi ? parseFloat(this.param.Threshold_Hi) : parseInt(this.param.Legend[0].Category.slice(1));
		}
	},
	methods: {
		pointStyle(feature, latlng) {
			return L.circleMarker(latlng, {
				fillColor: this.color(feature),
				fillOpacity: 1,
				weight: 0.5,
				opacity: 1,
				color: 'black',
				radius: 4,
				zIndexOffset: 40
			});
		},

		color(feature, param) {
			var result = parseFloat(feature.properties.LabValue);

			if( result > this.thresh_high) {
				return `#${this.color_high}`
			}
			else if (result > this.thresh_low) {
				return `#${this.color_med}`
			}
			else if(result == 0) {
				return 'none'
			}
			else {
				return `#${this.color_low}`
			}
		}
	}
};
</script>