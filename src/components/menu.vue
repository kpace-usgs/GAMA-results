<template>
	<div id='menu' class='leaflet-bar container'>
		<ToggleBar @click='toggle' :show='showControls'>
			<h1 slot='title'>GAMA - Priority Basin Project<br />Water-Quality Results*</h1>
			<h2 slot='elseTitle'>Show Menu +</h2>
		</ToggleBar>

	    <!-- Begin Controller Form -->
	    <div v-if='showControls' class='form'>
	        <!-- Groundwater Study Type Selector -->
	        <div>
		        <label class='labelDiv'>Groundwater Study Type: 
					<!-- <img src='../assets/images/moreInfo.png' 
					alt='Define study type' 
					:title='defineType' /> -->
					<Guidance :text='defineType'></Guidance>
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
		        <label class='labelDiv'>Select Constituent Class:
		        	<Guidance :text='defineClass'></Guidance>
					<!-- <img src='../assets/images/moreInfo.png' alt='Define constituent class' 
					:title='defineClass' /> -->
		        </label>

		       
	            <select style="width:300px;" v-model='parameterGroup'>
	                <option default value=''>Select One</option>
	            	<option v-for='paramGroup in listOfParameters' :value='paramGroup'>{{paramGroup.groupName}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Selector, dynamically populated based on which Parameter Group selected -->
		        <label class='labelDiv'>Select Constituent: 
		        	<Guidance :text='defineConst'></Guidance>
		        	<!-- <img src='../assets/images/moreInfo.png' alt='Define constituent' 
		        	:title='defineConst' /> -->
		        </label>

	            <select style="width:300px;" v-model='param'>
	            	<option default value=''></option>
	            	<option v-for='parameter in parameterGroup.parameters' :value='parameter'>{{parameter.name}}</option>
	            </select>
	        </div>

			<div id='layerSelector'>
		        <!-- Shapefile Selector -->
		        <label class='labelDiv'>Select Layers:
		        	<Guidance text='Polygons showing how the state is divided into grid cells, study units, and hydrogeologic provinces'></Guidance>
					<!-- <img src='../assets/images/moreInfo.png' alt='Define layers' title='Define layer' /> -->
		        </label>

		        <!-- only show checkbox options depending on which groundwater study type is selected -->
				<!-- show all options when "all" or "trends" are checked -->
				<!-- only show the public/domestic options if "public" or "domestic" types are selected -->
		        <div v-for='(layer, index) in layers'

		        	v-if='type != 2 && type != 3 ? true: type == layer.type ? true : layer.type == "all" ? true : false' 
		        	:class='{ disabled: zoom < layer.zoom }'
		        >

		        	<!-- disable checkbox according to zoom -->
					<input type='checkbox' 
					:disabled='zoom < layer.zoom ? true : false'
					:id='layer' :value='layer.value' 
					v-model='layerName'  :key='index'
					:title='zoom < layer.zoom ? "zoom in to view" : ""' >

					<label for='layer' 
					:title='zoom < layer.zoom ? "zoom in to view" : "" '>

						<!-- show prefix ("domestic-supply", "public-supply") if no type selection, if all types, or if trend types -->
						<span v-if='type == "" || type == 1 || type == 0'>{{layer.prefix}}</span> {{layer.string}}
					</label>
		        </div>
     		</div>
	      
			<!-- Download Button -->
            <a id='downloadButton' c
            	:class='{ disabled : parameterGroup.groupName === ""}'
            	:title='parameterGroup.groupName === "" ? "Please select a constituent class" : ""'
            	@click='downloadContent' 
            >
            	<p>Download Data from Constituent Class</p>
            </a>

		    <p>*The GAMA - PBP is a cooperative program between the <a href='http://www.swrcb.ca.gov/gama/' target='_blank' style='width: 100%; margin: 0;display: inline;'>California State Water Resources Control Board</a> and the <a href='/index.html' target='_blank' style='width: 100%; margin: 0;display: inline;'>US Geological Survey</a>.</p>
		    

		    <a @click='reset' id='reset' class='button' >
				<p>Reset Map</p>
		    </a>

	    </div>
	</div>
</template>

<script>
import listOfParameters from '../assets/listOfParameters.json';
import toggle from '../mixins/toggle.vue'
import ToggleBar from './toggleBar.vue';
import Guidance from './Guidance.vue';
import ParamData from '../mixins/getParamData.vue'
import BuildCSV from '../mixins/buildCSV.vue'

export default {
	name: 'MenuDiv',
	mixins: [toggle, ParamData, BuildCSV],
	props: ['zoom'],
	components: {
		ToggleBar, Guidance
	},
	data() {
		return {
			type: '',
			listOfParameters: listOfParameters,
			parameterGroup: {
				"parameters": [{
					"name": "Select parameter group first",
					"value": ""
				}],
				"groupName": ''
			},
			param: '',
			layers: [{
				"string": "Grid Cells",
				"prefix": "Domestic-supply",
				// "string": 'Domestic-supply Aquifer Grid Cells',
				"pane": 'shallowGridCells',
				"type": 2,
				"zoom": 8,
				"value": 0
			}, 
		
			{
				"string": "Grid Cells",
				"prefix": "Public-supply",
				// "string": 'Public-supply Aquifer Grid Cells', 
				"pane": 'deepGridCells',
				"type": 3,
				"zoom": 8,
				"value": 1
			}, {
				"string": "Study Units",
				"prefix": "Domestic-supply",
				// "string": 'Domestic-supply Aquifer Study Units', 
				"pane": 'shallowStudyUnits',
				"type": 2,
				"value": 2
			}, {
				"string": "Study Units",
				"prefix": "Public-supply",
				// "string": 'Public-supply Aquifer Study Units',
				"pane": 'deepStudyUnits',
				"type": 3,
				"value": 3
			}, {
				"string": 'Hydrogeologic Provinces',
				"pane": 'provinces',
				"type": 'all',
				"value": 4
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
			console.log(this.type);
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
			this.parameterGroup = {
				"parameters": [{
					"name": "Select parameter group first",
					"value": ""
				}],
				"groupName": ''
			};
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


<style scoped>
#menu {
    top: 50px;
    right: 10px;
    font-size: 16px;
}
h2{
	font-size: 14px;
	font-weight: bold;
	margin: 0;
}

.form>div{
	margin-bottom: 10px;
}
select{
	margin: 5px 0px;
	height: 20px;
	font-size: 16px;
}
select:hover, input:hover, button:hover{
	box-shadow: 1px 1px 10px grey;
	cursor: pointer;
	font-family: 'Calibri';
}
.labelDiv{
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
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
	/*background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);*/
	background: #D3CCE3;  /* fallback for old browsers */
	background: -webkit-linear-gradient(to right, #E9E4F0, #D3CCE3);  /* Chrome 10-25, Safari 5.1-6 */
	background: linear-gradient(to right, #E9E4F0, #D3CCE3); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
#downloadButton p{
	margin-top: 12px;
}

.button:not(.disabled):hover{
	box-shadow: 2px 2px 10px 1px grey;
	width: 100%;
}
.button.disabled, #downloadButton.disabled{
	cursor: not-allowed;
	color: grey;
	background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
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

#layerSelector>div.disabled>input{
	cursor: not-allowed;
}
#layerSelector>div.disabled>label{
	text-decoration: line-through;
	color: grey;
}
</style>