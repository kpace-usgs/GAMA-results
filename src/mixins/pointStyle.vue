<script>
export default {
	name: 'pointStyle',

	computed: {

		// save the symbology colors for each entry in the selected parameter's legend array
		color_low(){
			if(this.param.Threshold_Low){
				return this.param.Legend.find(item => {
					return item.LegendItem == this.param.LegendCount; //find the final item
				}).Color;
			}
			else {
				return this.param.Legend.find(item => {
					return item.LegendItem == this.param.LegendCount - 1; // if a number of detects sort, the final item's color is "none". we want the penultimate entry.
				}).Color
			}
			
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

			var thresh = this.param.Threshold_Low ? this.param.Threshold_Low : this.param.Legend[this.param.LegendCount - 2].Category;

			console.log('thresh low: ' + thresh);
			return parseFloat(thresh);  // this still isn't great for Carbon-14 where no Threshold_Low is given but also shouldn't be using Category
		},

		thresh_high() {
			var thresh = this.param.Threshold_Hi ? this.param.Threshold_Hi : this.param.Legend[0].Category.slice(1);

			console.log('thresh high: ' + thresh);

			return parseFloat(thresh);
		}
	},
	methods: {
		pointStyle(feature, latlng) {
			var compare = this.compare(feature);

			return L.circleMarker(latlng, {
				fillColor: compare.color,
				fillOpacity: 1,
				weight: 0.5,
				opacity: 1,
				color: 'black',
				radius: 4,
				className: compare.result
			});
		},

		compare(feature) {
			var result = parseFloat(feature.properties.LabValue);

			var color; 
			var result;

			if( result > this.thresh_high) {
				color = `#${this.color_high}`;
				result = 'high'
			}
			else if (result > this.thresh_low) {
				color = `#${this.color_med}`;
				result = 'med'
			}

			else if (result > 0) {
				color =  `#${this.color_low}`;
				result = 'low'
			}

			else {
				color = 'none';
				result = 'none'
			}

			return {
				color: color,
				result: result
			}

		}
	}
};
</script>

<style>

.low{
	z-index: 3;
}
.med {
	z-index: 10;
}
.high {
	z-index: 200;
}