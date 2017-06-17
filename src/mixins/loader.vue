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
			console.log('toggle loader');
			this.isLoading = !this.isLoading
		}
	}
}
</script>
