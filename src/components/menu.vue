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
					<img src='../assets/images/moreInfo.png' 
					alt='Define study type' 
					:title='defineType' />
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
					<img src='../assets/images/moreInfo.png' alt='Define constituent class' 
					:title='defineClass' />
		        </label>

		       
	            <select style="width:300px;" v-model='parameterGroup'>
	                <option default value=''>Select One</option>
	            	<option v-for='paramGroup in listOfParameters' :value='paramGroup'>{{paramGroup.groupName}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Selector, dynamically populated based on which Parameter Group selected -->
		        <label>Select Constituent: 
		        	<img src='../assets/images/moreInfo.png' alt='Define constituent' 
		        	:title='defineConst' />
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
		        <div v-for='(layer, index) in layers' >
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
	      
			<!-- Download Button -->
            <a id='downloadButton'
            	:class='{disabled : !parameterGroup.groupName}' 
            	@click='downloadContent' 
            >
            	<p>Download Data from Constituent Class</p>
            </a>

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
import BuildCSV from '../mixins/buildCSV.vue'

export default {
	name: 'MenuDiv',
	mixins: [toggle, ParamData, BuildCSV],
	props: ['zoom'],
	data() {
		return {
			type: '',
			listOfParameters: listOfParameters,
			parameterGroup: {
				"parameters": [{
					"name": "Select parameter group first",
					"value": "",
					"groupName" : ''
				}]
			},
			param: '',
			layers: [{
				// "string": "Grid Cells",
				"string": 'Domestic-supply Aquifer Grid Cells',
				"pane": 'shallowGridCells',
				"type": 2,
				"zoom": 8
			}, {
				//"string": "Grid Cells",
				"string": 'Public-supply Aquifer Grid Cells', 
				"pane": 'deepGridCells',
				"type": 3,
				"zoom": 8
			}, {
				//"string": "Study Units",
				"string": 'Domestic-supply Aquifer Study Units', 
				"pane": 'shallowStudyUnits',
				"type": 2
			}, {
				//"string": "Study Units",
				"string": 'Public-supply Aquifer Study Units',
				"pane": 'deepStudyUnits',
				"type": 3
			}, {
				"string": 'Hydrogeologic Provinces',
				"pane": 'provinces',
				"type": ''
			}],
			layerName: [],
			thresholds: '',
			readme: '',
			defineType: 'Groundwater study type refers to the three types of assessment conducted by the GAMA-PBP: Public-Supply Aquifer Assessments, Shallow Aquifer Assessment, and Trend Assessments. Users can display sites from all three assessment types by selecting "All Sites" or they can limit the display by Assessment Type',
			defineClass: 'Mappable constituents are grouped by class. Constituent classes are groupings of constituents based on similar physical or chemical properties. Not all constituents analyzed by the GAMA-PBP are available to be mapped. The mapper is primarily focused on providing the ability to display constituents with health-based and non-health based benchmarks and other select constituents such as tracers of groundwater age',
			defineConst: 'Some classes allow for individual constituents to be displayed (Trace Elements and Nutrients for example) while others (VOCs and Pesticides) use primary use categories to simplify the data for display'
		}
	},
	watch: {
	
		layerName(){
			return this.$emit('changeLayer', this.layerName);
		},
		param(){
			return this.$emit('changeParam', this.param);
		},
		type(){
			// clear selected layer if any layer other than hydrogeologic provinces
			this.layerName = this.layerName.indexOf(4) === -1 ? [] : [4];

			// tell rest of app about the change
			return this.$emit('changeType', this.type);
		}
	},
	methods: {
		downloadContent(){
			/* query data from arcServer for each parameter in the selected parameter group*/
			var that = this;
			// define callback function
			var callback = function(){
				that.createAndOpenLink(encodeURI(that.csvBody), that.fileName)
				that.createAndOpenLink('downloads/thresholds.csv', 'thresholds.csv');
				that.createAndOpenLink('downloads/resultCodes.csv', 'readme.csv');
			};

			// invoke promise defined in buildCSV.vue
			this.importArrayOfValues(this.parameterGroup.parameters, callback);
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
			this.$emit('resetClicked');
		}
	},
	computed: {
		fileName(){
			return this.parameterGroup.groupName + '.csv'
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