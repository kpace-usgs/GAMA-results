<script>
export default{
	name: 'Toggle',
	data(){
		return {
			mobileBound: 600,
			showControls: '',
			width: ''
		}
	},
	mounted(){
		window.addEventListener('resize', this.onResize);
		this.onResize();
	},
	methods: {
		toggle() {
			this.showControls = !this.showControls
		},
		onResize() {
			this.width = window.innerWidth;
			this.showControls = this.width < this.mobileBound ? false : true
		}
	}
}
</script>