<template>
	<div id='container' class='leaflet-bar'>
		<div class='toggleBar'>
	    	<h1 v-if='showControls'>GAMA - Priority Basin Project<br />Water-Quality Results*</h1>
	    	<a class="toggle" @click='toggle' style="width: 100px;">
				<span v-if='showControls === false' >Show Menu +</span>
				<span v-if='showControls'>&times;</span>
			</a>
		</div>
	    <!-- Begin Controller Form -->
	    <div v-if='showControls' class='form'>
	        <!-- Groundwater Study Type Selector -->
	        <div>
		        <label>Groundwater Study Type: </label>
	            <select id="base" style="width:300px;" v-model='type' @change='handleType'>
	                <option value=""> </option>
	                <option value="STATUS">All Sites</option>
	                <option value="SHALLOW">Domestic-supply Aquifer Sites</option>
	                <option value="DEEP">Public-supply Aquifer Sites</option>
	                <option value="TRENDS">Trends</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Group Selector -->
		        <label>Select Parameter Group:</label>
	            <select style="width:300px;" v-model='parameterGroup'>
	                <option default value=''>Select One</option>
	            	<option v-for='paramGroup in listOfParameters' :value='paramGroup'>{{paramGroup.groupName}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Selector, dynamically populated based on which Parameter Group selected -->
		        <label>Select Parameter:</label>
	            <select style="width:300px;" v-model='param' @change='handleParam'>
	            	<option v-for='parameter in parameterGroup.parameters' :value='parameter'>{{parameter.name}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Shapefile Selector -->
		        <label>Select Layers:</label>
		        <div v-for='(layer, index) in layers'>
					<input type='checkbox' :id='layer' :value='layer' v-model='layerName' @click='handleLayer' :key='index'>
					<label for='layer'>{{layer}}</label>
		        </div>
     		</div>
	      

		    <!-- Download Button -->
		    <button type="button" style="width:200px;display:block; margin-left:auto; margin-right:auto;">Download Data from Selected Parameter Group</button>
		    <p style="font-size:xx-small">*The GAMA - PBP is a cooperative program between the California State Water Resources Control Board and the US Geological Survey.</p>
		    <!-- insert study_unit_code.html in future -->
	    </div>
	</div>
</template>

<script>
import listOfParameters from '../assets/listOfParameters.json';

export default {
	name: 'MenuDiv',
	props: ['showControls'],
	data() {
		return {
			type: '',
			listOfParameters: listOfParameters,
			parameterGroup: {
				"parameters": [{
					"name": "Select parameter group first",
					"value": ""
				}]
			},
			param: '',
			layers: ['Domestic-supply Aquifer Grid Cells', 'Public-supply Aquifer Grid Cells', 
				'Domestic-supply Aquifer Study Units', 
				'Public-supply Aquifer Study Units',
				'Hydrogeologic Provinces'],
			layerName: []
		}
	},
	methods: {
		toggle(){
			this.showControls = !this.showControls
		},
		handleLayer(){
			this.$emit('changeLayer', this.layerName);
		},
		handleParam(){
			this.$emit('changeParam', this.param);
		},
		handleType(){
			this.$emit('changeType', this.type);
		}
	}
}
</script>

<style> 
.toggle{
	font-size: small;
}
.toggle:hover{
	cursor: pointer;
}

.toggleBar{
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	width: 100%;
}

</style>


<style scoped>
#container{
	max-height: 80vh;
	overflow-y: auto;
	overflow-x: hidden;
}
h2{
	font-size: 14px;
	font-weight: bold;
	margin: 0;
}
.form>div{
	margin-bottom: 10px;
	font-size: 1.2em;
}
select{
	margin: 5px 0px;
	height: 20px;
}
select:hover, input:hover, button:hover{
	box-shadow: 1px 1px 10px grey;
	cursor: pointer;
}

</style>