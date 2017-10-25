<template>
	<div style='width: auto; height: auto; '  class='tooltip-container' @click='toggleTooltip' @mouseover='showTooltip' @mouseleave='hideTooltip'>
		<icon name='question-circle-o' :label='text' 
		aria-label='what is this option' :data-tooltip-content='text'></icon>
		<span role='tooltip' v-if='show' class='tooltip'>
			<span class='toggletip-bubble'>{{text}}</span>
		</span>
	</div>
</template>

<script>
import 'vue-awesome/icons/question-circle-o';
export default{
	name: 'Guidance',
	props: ['text'],
	data(){
		return {
			show: false
		}
	},
	methods: {
		toggleTooltip(){
			console.log('show')
			this.show = !this.show;
		},
		showTooltip(){
			if(!this.show){
				this.show = true;
			}
		},
		hideTooltip(){
			if(this.show){
				this.show = false;
			}
		}
	}
}
</script>


<style scoped>
.tooltip-container{
	cursor: pointer;
}

.tooltip{
	background-color: #D3CCE3;
	width: 90%;
	position: absolute;
	left: 0;
	padding: 5px;
	border: 1px solid grey;
}
</style>