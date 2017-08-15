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
		toggleLoading(binary){
			console.log('toggle loader to: ' + binary);
			this.isLoading = binary;
		}
	}
}
</script>
