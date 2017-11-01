<template>
	<div>
		<slot name='h3'></slot>
		<div>
			<slot name='category'><p>Category</p></slot>
			<p>Symbology</p>
		</div>
		<div>
			<slot name='cat1'></slot>
			<slot name='img1'></slot>
		</div>
		<div>
			<slot name='cat2'></slot>
			<slot name='img2'></slot>
		</div>
		<div>
			<slot name='cat3'></slot>
			<slot name='img3'></slot>
		</div>
		<div>
			<p>Benchmark: </p>
			<slot name='benchmark'></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LegendContent'
}
</script>

