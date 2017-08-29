<template>
	<div style='width: auto; height: auto; ' :title='text'>
		<icon name='question-circle-o' :label='text'></icon>
	</div>
</template>

<script>
import 'vue-awesome/icons/question-circle-o';
export default{
	name: 'Guidance',
	props: ['text']
}
</script>
