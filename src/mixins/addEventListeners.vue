<script>
export default {
	methods: {
		addEventListeners(layer) {
			layer.on('loading', e => {
				this.$emit('toggleLoading', true);
			});

			layer.on('load', e => {
				this.$emit('toggleLoading', false)
			});
		}
	}
}
</script>