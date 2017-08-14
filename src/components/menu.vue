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
		        <label>Groundwater Study Type: 
					<img src='../assets/images/moreInfo.png' alt='Define study type' title='Define study type' />
		        </label>

	            <select id="base" style="width:300px;" v-model='type'>
	                <option value=""> </option>
	                <option value="0">All Sites</option>
	                <option value="2">Domestic-supply Aquifer Sites</option>
	                <option value="3">Public-supply Aquifer Sites</option>
	                <option value="1">Trends Sites</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Group Selector -->
		        <label>Select Constituent Class:
					<img src='../assets/images/moreInfo.png' alt='Define constituent class' title='Define constituent class' />
		        </label>

		       
	            <select style="width:300px;" v-model='parameterGroup'>
	                <option default value=''>Select One</option>
	            	<option v-for='paramGroup in listOfParameters' :value='paramGroup'>{{paramGroup.groupName}}</option>
	            </select>

				<!-- Download Button -->

	            <a id='downloadButton'
	            	class='button' 
	            	v-if='parameterGroup.groupName'
	            	@click='downloadContent' 
	            >
	            	<p>Download Data from Constituent Class</p>
	            </a>
	        </div>

			<div>
		        <!-- Parameter Selector, dynamically populated based on which Parameter Group selected -->
		        <label>Select Constituent: 
		        	<img src='../assets/images/moreInfo.png' alt='Define constituent' title='Define constituent' />
		        </label>

	            <select style="width:300px;" v-model='param'>
	            	<option default value=''></option>
	            	<option v-for='parameter in parameterGroup.parameters' :value='parameter'>{{parameter.name}}</option>
	            </select>
	        </div>

			<div id='layerSelector'>
		        <!-- Shapefile Selector -->
		        <label>Select Layers:
					<img src='../assets/images/moreInfo.png' alt='Define layers' title='Define layer' />
		        </label>

		        <!-- only show checkbox options depending on which groundwater study type is selected -->
		        <div v-for='(layer, index) in layers' 
		        	v-if='layer.type != "" ? type == layer.type : true'
		        	:class='{ disabled: zoom < layer.zoom }'
		        >
					<input type='checkbox' 
					:disabled='zoom < layer.zoom ? true : false'
					:id='layer' :value='index' 
					v-model='layerName'  :key='index'
					:title='zoom < layer.zoom ? "zoom in to view" : ""' >
					<label for='layer' 
					:title='zoom < layer.zoom ? "zoom in to view" : ""'>
						{{layer.string}}
					</label>
		        </div>
     		</div>
	      

		    <p style="font-size:xx-small">*The GAMA - PBP is a cooperative program between the California State Water Resources Control Board and the US Geological Survey.</p>
		    

		    <a @click='reset' id='reset' class='button' >
				<p>Reset Map</p>
		    </a>

	    </div>
	</div>
</template>

<script>
import listOfParameters from '../assets/listOfParameters.json';
import toggle from '../mixins/toggle.vue'
import ParamData from '../mixins/getParamData.vue'

export default {
	name: 'MenuDiv',
	mixins: [toggle, ParamData],
	props: ['wells', 'zoom'],
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
				"string": "Grid Cells",
				// "string": 'Domestic-supply Aquifer Grid Cells',
				"pane": 'shallowGridCells',
				"type": 2,
				"zoom": 8
			}, {
				"string": "Grid Cells",
				// "string": 'Public-supply Aquifer Grid Cells', 
				"pane": 'deepGridCells',
				"type": 3,
				"zoom": 8
			}, {
				"string": "Study Cells",
				// "string": 'Domestic-supply Aquifer Study Units', 
				"pane": 'shallowStudyUnits',
				"type": 2
			}, {
				"string": "Study Cells",
				// "string": 'Public-supply Aquifer Study Units',
				"pane": 'deepStudyUnits',
				"type": 3
			}, {
				"string": 'Hydrogeologic Provinces',
				"pane": 'provinces',
				"type": ''
			}],
			layerName: [],
			thresholds: '',
			readme: ''
		}
	},
	watch: {
		// parameterGroup(){
		// 	this.buildPromises();
		// },
		layerName(){
			return this.$emit('changeLayer', this.layerName);
		},
		param(){
			return this.$emit('changeParam', this.param);
		},
		type(){
			console.log(this.layerName);
			// clear selected layer if any layer other than hydrogeologic provinces
			if(this.layerName.length >= 2){
				console.log(this.layerName.length);
				this.layerName = this.layerName.indexOf(4) === -1 ? [] : [4];
			} 

			// tell rest of app about the change
			return this.$emit('changeType', this.type);
		}
	},
	methods: {

		downloadContent(){
			var that = this;
			var getData = new Promise(
				(resolve, reject) => {
					resolve(that.importParamData(that.promises[0]));
					
			}).then(
				function(res){
					console.log('done');
					that.createAndOpenLink(encodeURI(that.csvBody), that.fileName)
				},
				function(){
					console.log('failed');
				}
			).catch(
				(reason) => {
					console.log('handle rejected promise ' + reason);
				}
			)
			
			// this.createAndOpenLink('downloads/thresholds.csv', 'thresholds.csv');
			// this.createAndOpenLink('downloads/resultCodes.csv', 'readme.csv');
	 
		},

		createAndOpenLink(href, filename){
			console.log('creating file');
			var link = window.document.createElement('a');
			link.href = href;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		},

		reset() {
			// reset values on map and menu when reset button clicked
			this.layerName = [],
			this.param = '';
			this.type = '';
			this.parameterGroup = {
				"parameters": [{
					"name": "Select parameter group first",
					"value": ""
				}]
			};
		}
	},
	computed: {
		wellsLength(){
			return this.wells.length;
		},
		fileName(){
			return this.parameterGroup.groupName + '.csv'
		},
		promises(){
			var arr = [];
			for(var i = 0; i < this.parameterGroup.parameters.length; i++) {
				arr.push(this.parameterGroup.parameters[i].value);
			}
			return arr;
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
#downloadButton, .button{
	text-align: center;
	width: 100%;
	display: block;
	height: 50px;
	border-radius: 5px;
	border: 1px solid grey;
	cursor: pointer;
	text-decoration: none;
}

#downloadButton:not(.disabled):hover{
	box-shadow: 2px 2px 10px 1px grey;
}
#downloadButton.disabled{
	cursor: not-allowed;
	color: grey;
}

#reset{
	margin-bottom: 0px;
	padding: 0 0 5px;
	height: 20px;
	border-bottom: 1px solid grey;
}
#reset p{
	margin: 0;
	height: 90%;
}
#reset:hover{
	box-shadow: 2px 2px 10px 1px grey;
	width: 100%;
}
#layerSelector>div.disabled>input{
	cursor: not-allowed;
}
#layerSelector>div.disabled>label{
	text-decoration: line-through;
	color: grey;
}
</style>