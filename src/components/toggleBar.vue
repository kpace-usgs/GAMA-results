<template>
	<div class='toggleBar' @click='toggle' :class='{"min" : !show}'>
		<div v-if='show'>
			<slot name='title'><h2></h2></slot>
			<icon name='times' scale='1.5'></icon>
		</div>
		<div v-else class='min'>
			<slot name='elseTitle'>
				<h2>Show Legend</h2>
				<icon name='plus' scale='1'></icon>
			</slot>
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
		padding-bottom: 5px;
		cursor: pointer;
	}
	.toggleBar>div{
		display: flex;
		justify-content: space-between;
		width: 100%;
	}
	.toggleBar.min{
		min-width: 10px;
	}
	.toggleBar>div.min{
		align-items: flex-end;
	}
	.toggleBar h1, .toggleBar h2{
		margin: 0;
		font-weight: 400;
	}
</style>