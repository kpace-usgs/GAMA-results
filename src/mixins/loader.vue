<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default{
	name: 'Loader',
	components: { PulseLoader },
	data(){
		return {
			isLoading: true
		}
	},
	methods: {
		toggleLoading(){
			console.log('toggle loader to: ' + !this.isLoading);
			this.isLoading = !this.isLoading

			// if data have finished loading, send updated well data to app.vue
			if(this.isLoading == false){
				this.$emit('wellsLoaded', this.wells);
			}
		}
	}
}
</script>
