<template>
	<div class="message"><h3>{{ msg }}</h3></div>
</template>

<script>
export default {
	name: 'App',
	  data () {
	    return {
	      msg: 'Goodbye!'
	    }
	  }
}
</script>

<style>
.message {
  color: blue;
}
</style>