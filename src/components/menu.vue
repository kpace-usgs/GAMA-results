<template>
	<div id='container' class='leaflet-bar'>
		<div class='toggleBar'>
	    	<h1 v-if='showControls'>GAMA - Priority Basin Project<br />Water-Quality Results*</h1>
	    	<a class="toggle" @click='toggle'>
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
	                <option value="0">All Sites</option>
	                <option value="2">Domestic-supply Aquifer Sites</option>
	                <option value="3">Public-supply Aquifer Sites</option>
	                <option value="1">Trends</option>
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
	            	<option default value=''></option>
	            	<option v-for='parameter in parameterGroup.parameters' :value='parameter'>{{parameter.name}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Shapefile Selector -->
		        <label>Select Layers:</label>
		        <div v-for='(layer, index) in layers'>
					<input type='checkbox' :id='layer' :value='index' v-model='layerName' @click='handleLayer' :key='index'>
					<label for='layer'>{{layer.string}}</label>
		        </div>
     		</div>
	      

		    <!-- Download Button -->
		    <a :href='encodedUri' 
		    	:download='fileName' id='downloadButton'
		    	:class='{disabled : wellsLength == 0}'>
		    	<p>Download Data from Selected Parameter Group</p>
			</a>
		    <p style="font-size:xx-small">*The GAMA - PBP is a cooperative program between the California State Water Resources Control Board and the US Geological Survey.</p>
		    <!-- insert study_unit_code.html in future -->
	    </div>
	</div>
</template>

<script>
import listOfParameters from '../assets/listOfParameters.json';
import toggle from '../mixins/toggle.vue'

export default {
	name: 'MenuDiv',
	mixins: [toggle],
	props: ['wells'],
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
			layers: [{
				"string": 'Domestic-supply Aquifer Grid Cells',
				"pane": 'shallowGridCells'
			}, {
				"string": 'Public-supply Aquifer Grid Cells', 
				"pane": 'deepGridCells'
			}, {
				"string": 'Domestic-supply Aquifer Study Units', 
				"pane": 'shallowStudyUnits'
			}, {
				"string": 'Public-supply Aquifer Study Units',
				"pane": 'deepStudyUnits'
			}, {
				"string": 'Hydrogeologic Provinces',
				"pane": 'provinces'
			}],
			layerName: []
		}
	},
	methods: {
		handleLayer(){
			this.$emit('changeLayer', this.layerName);
		},
		handleParam(){
			this.$emit('changeParam', this.param);
		},
		handleType(){
			this.$emit('changeType', this.type);
		}
	},
	computed: {
		wellsLength(){
			return this.wells.length;
		},
		fileName(){
			return this.param.name + '.csv'
		},
		encodedUri(){
			var csvContent = "data:text/csv;charset=utf-8,";
			csvContent += this.csvHeader;

			for(var i = 0; i < this.wellsLength; i++){
				var dataString = this.wells[i];
				csvContent += i < this.wellsLength ? dataString+ "\n" : dataString;
			} 
			return encodeURI(csvContent);
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
	justify-content: flex-end;
	align-items: flex-start;
}
.toggleBar>a{
	margin-left: auto;
	width: 100px;
	text-align: right;
	padding: 0 10px;
}
.toggleBar a:hover{
	background-color: transparent;
	width: 100px;
	text-align: right;
	padding: 0 10px;
}
</style>


<style scoped>
#container{
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
#downloadButton{
	text-align: center;
	width: 100%;
	display: block;
	height: 50px;
	border-radius: 5px;
	border: 1px solid grey;
}
#downloadButton:not(.disabled):hover{
	box-shadow: 2px 2px 10px 1px grey;
}
#downloadButton.disabled{
	cursor: not-allowed;
	color: grey;
}

</style>