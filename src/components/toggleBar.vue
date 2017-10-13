<template>
	<div class='toggleBar' @click='toggle' :class='{"min" : !show}'>
		<div v-if='show'>
			<slot name='title'><h2></h2></slot>
			<icon name='times' scale='1.5'></icon>
		</div>
		<div v-else class='min'>
			<slot name='elseTitle'>
				<h2>Show Legend</h2>
			</slot>
			<icon name='plus' scale='1'></icon>
		</div>
	</div>
</template>

<script>
import 'vue-awesome/icons/times'
import 'vue-awesome/icons/plus'

export default{
	name: 'ToggleBar',
	props: ['show'],
	methods: {
		toggle(){
			this.$emit('click');
		}
	}
}
</script>

<style scoped>
	.toggleBar{
		min-width: 100px;
		min-height: 10px;
		padding-bottom: 5px;
	}
	.toggleBar>div{
		display: flex;
		justify-content: space-between;
		position: absolute;
		right: 5px;
		width: 96%;
		top: 2px;
	}
	.toggleBar.min{
		width: 100%;
	}
	.toggleBar.min h2{
		padding-left: 3px;
	}

	.toggleBar h1, .toggleBar h2{
		margin-top: 3px;
		font-weight: 400;
	}
	.fa-icon{
		cursor: pointer;
	}
</style>