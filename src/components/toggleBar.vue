<template>
	<div class='toggleBar' @click='toggle'>
		<div v-if='show'>
			<slot name='title'><h2>Explanation</h2></slot>
			<icon name='times' scale='1.5'></icon>
		</div>
		<div v-else>
			<slot name='elseTitle'><h2>Show Legend +</h2></slot>
		</div>
	</div>
</template>

<script>
import 'vue-awesome/icons/times'

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
	.toggleBar h1, .toggleBar h2{
		margin: 0;
		font-weight: 400;
	}
</style>