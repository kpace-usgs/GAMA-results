<template>
	<div id='menu' class='leaflet-bar container'>
		<ToggleBar @click='toggle' :show='showControls'>
			<h1 slot='title'>
				<span title='Groundwater Ambient Monitoring and Assessment Priority Basin Project' style='border-bottom: 1px dashed grey; cursor: help'>GAMA - PBP</span> Water-Quality Results*
			</h1>
			<h2 slot='elseTitle'>Show Menu</h2>
		</ToggleBar>

	    <!-- Begin Controller Form -->
	    <div v-if='showControls' class='form'>
	        <!-- Groundwater Study Type Selector -->
	        <div>
		        <label class='labelDiv'>Groundwater Study Type: 
					<Guidance :text='defineType'></Guidance>
		        </label>

	            <select id="base"  v-model='type' :class='{highlighted: type=="", shaded: type != ""}'>
	            	<!-- do not change the values unless you are going to change the rest of the code -->
	                <option default value="">Select One</option>
	                <option value='3'>All Sites</option>
	                <option value='2'>Public-supply Aquifer Sites</option>
	                <option value='1'>Domestic-supply Aquifer Sites</option>
	                <option value='0'>Public-supply Trends Sites</option>
	                <option value='4'>Domestic-supply Trends Sites</option>
	            </select>
	        </div>


			<div>
		        <!-- Constituent Class Selector -->
		        <label class='labelDiv'>Select Constituent Class:
		        	<Guidance :text='defineClass'></Guidance>
		        </label>

		       
	            <select  v-model='parameterGroup' :class='{ highlighted: parameterGroup.groupName == "", shaded: parameterGroup.groupName != ""}'>
	                <option :value='defaultParamGroup'>Select One</option>

	            	<option v-for='paramGroup in sortedParameterGroups' :value='paramGroup'>{{paramGroup.groupName}}</option>
	            </select>
	        </div>

			<div>
		        <!-- Parameter Selector, dynamically populated based on which Parameter Group selected -->
		        <label class='labelDiv'>Select Constituent: 
		        	<Guidance :text='defineConst'></Guidance>
		        </label>

	            <select :class='{ highlighted: param.value == "" && parameterGroup.groupName != "", shaded: param.value != "" || parameterGroup.groupName == ""}' v-model='param'>
	         		<option :value='defaultParamGroup.parameters[0]' default></option>
	            	<option v-for='parameter in sortedParameters' :value='parameter'>{{parameter.Constituent}}</option>
	            </select>
	        </div>

	        <!-- add slider bar to change trend series. if this.type == 0 or 4 the trends t0 layer is returned instead of the param layer and is queried for Public-supply or Domestic-supply -->
	        <div v-if='(type === "0" || type==="4") && param.PCODE' style='z-index: 99;' >

				<label class='labelDiv'>
					Select a study unit trend visit
					<Guidance :text='defineTrend'></Guidance>
				</label>
	        	<!-- the data array should be the same length as the parameter's trends array, but instead of the layer value, each index should be an integer between 0 and N -->
	        	<VueSlider
	        	ref='slider'
	        	v-model='trendIndex'
	     
	        	:data='trendArr'
	        	:interval = 1
	        	:piecewiseLabel='true'
	        	height= '15'
	        	width='100%'
	        	:piecewise='true'
	        	:lazy='true'
	        	tooltip = 'hover'
	        	tooltip-dir='top'
	        	:bgStyle = '{"border": "1px solid black", "height": "16px", "background-color": "#ebedee"}'
	        	:piecewise-style='{"background-color": "none"}'
	        	:slider-style='{ "background-color": "#896FC3"}'
	        	:process-style='{"background-color": "#896FC3"}'
	        	>	
	        	</VueSlider>
	        </div>



			<div id='layerSelector'>
		        <!-- Shapefile Selector -->
		        <label class='labelDiv'>Select Layers:
		        	<Guidance text='Polygons showing how the state is divided into grid cells, study units, and hydrogeologic provinces'></Guidance>
		        </label>

		        <!-- only show checkbox options depending on which groundwater study type is selected -->
				<!-- show only study units and provinces on initial render, show all options when "all sites" is checked -->
				<!-- only show the public/domestic options if "public" or "domestic" types are selected -->
		        <div v-for='(layer, index) in layers'
		        	v-if=' type == "" || type === "3" || layer.value == 7 || domesticOrPublic === layer.prefix ? true: false' >

					<input type='checkbox' 
					:id='layer' :value='layer.value' 
					v-model='layerName'  :key='index'>

					<label for='layer'>
						{{layer.string}}
					</label>
		        </div>
     		</div>
	      
			<!-- Download Button -->
			<!-- this option is using zip files made sometime in 2016 (?) until we can work out the server script -->
            <a id="downloadButton" 
            	:href='zipHref'
            	:download = 'fileName'
            	class='button'
            	:class='{ disabled : parameterGroup.groupName === ""}'
            	:title='parameterGroup.groupName === "" ? "Please select a constituent class" : ""'
            >
            	<p>Download Data from Constituent Class</p>	
            </a>

		    <p class='small'>*The Groundwater Ambient Monitoring and Assessment - Priority Basin Project (GAMA - PBP) is a cooperative program between the <a href='http://www.swrcb.ca.gov/gama/' target='_blank' style='width: 100%; margin: 0;display: inline;'>California State Water Resources Control Board</a> and the <a href='/index.html' target='_blank' style='width: 100%; margin: 0;display: inline;'>U.S. Geological Survey</a>.</p>
		    

		    <a @click='reset' id='reset' class='button' >
				<p>Reset Map</p>
		    </a>
		
	    </div>
	</div>
</template>

<script>
//import listOfParameters from '../assets/listOfParameters.json';
import ToggleBar from './toggleBar.vue';
import VueSlider from 'vue-slider-component/src/vue2-slider.vue'
import Guidance from './Guidance.vue';
import BuildCSV from '../mixins/buildCSV.vue'
import toggle from '../mixins/toggle.vue'


// TODO changing type to non-trend changes this.trendIndex to ""; changing type to a trend changes this.trendIndex to 0
export default {
	name: 'MenuDiv',
	mixins: [ BuildCSV, toggle],
	props: [ 'infos', 'trendVisits' ],
	components: {
		ToggleBar, Guidance, VueSlider
	},

	data() {
		return {
			type: '',
			trendIndex: '',
			parameterGroup: '',
			defaultParamGroup: {
				"parameters": [{
					"Constituent": "Select constituent class first",
					"PCODE": ""
				}],
				"groupName": ""
			},
			param: {
				"Constituent": "",
				"PCODE": ""
			},
			layers: [{
				"prefix": "Domestic-supply",
				 "string": 'Domestic-supply Aquifer Grid Cells',
				"pane": 'shallowGridCells',
				"value": 3
			}, {
				"prefix": "Public-supply",
				"string": 'Public-supply Aquifer Grid Cells', 
				"pane": 'deepGridCells',
				"value": 4
			}, {
				"prefix": "Domestic-supply",
				"string": 'Domestic-supply Aquifer Study Units', 
				"pane": 'shallowStudyUnits',
				"value": 5
			}, {
				"prefix": "Public-supply",
				"string": 'Public-supply Aquifer Study Units',
				"pane": 'deepStudyUnits',
				"value": 6
			}, {
				"string": 'Hydrogeologic Provinces',
				"pane": 'provinces',
				"value": 7
			}],
			layerName: [],
			thresholds: '',
			readme: '',
			defineType: 'Groundwater study type refers to the three types of assessment conducted by the GAMA-PBP: Public-Supply Aquifer Assessments, Shallow Aquifer Assessment, and Trend Assessments. Users can display sites from all three assessment types by selecting "All Sites" or they can limit the display by Assessment Type',
			defineClass: 'Mappable constituents are grouped by class. Constituent classes are groupings of constituents based on similar physical or chemical properties. Not all constituents analyzed by the GAMA-PBP are available to be mapped. The mapper is primarily focused on providing the ability to display constituents with health-based and non-health based benchmarks and other select constituents such as tracers of groundwater age',
			defineConst: 'Some classes allow for individual constituents to be displayed (Trace Elements and Nutrients for example) while others (VOCs and Pesticides) use primary use categories to simplify the data for display',
			defineTrend: ''
		}
	},
	mounted(){
		this.parameterGroup = this.defaultParamGroup;
		this.param = this.defaultParamGroup.parameters[0];
	},
	watch: {
		parameterGroup(){
			console.log(this.parameterGroup);
			// reset the param value if the groupname is being reset or if it's being changed while the param doesn't have a value
			if(this.parameterGroup.groupName == "" || this.param.value != ""){
				this.param = this.defaultParamGroup.parameters[0];
				this.trendIndex = ""
			} 
		},
		layerName(){
			return this.$emit('changeLayer', this.layerName);
		},
		param(){
			console.log('menu sees param changed');

			return this.$emit('changeParam', this.param); 
		},
		type(){
			console.log(this.type);
			// clear selected layer if any layer other than hydrogeologic provinces
			this.layerName = this.layerName.indexOf(4) === -1 ? [] : [4];

			// if the type is changing and a constituent class has been selected but no constituent has been selected, reset the constituent class input
			if(this.param.value == ""){
				this.parameterGroup = this.defaultParamGroup;
			}

			//this.trendIndex = ""; //changng the type resets the trendIndex 

			// tell rest of app about the change
			return this.$emit('changeType', this.type);
		},


		/* when the slider on the menu is moved, emit to app */
		trendIndex(){
			console.log('trend index changed to : ' + this.trendIndex);
			this.$emit('changeTrend', this.trendIndex)
		},

		trendVisits(){
			console.log('menu sees number of trend visits changed')
		}
	},
	methods: {
		
		reset() {
			// reset values on map and menu when reset button clicked
			this.layerName = [],
			this.param = this.defaultParamGroup.parameters[0]; 
			this.type = ''; 
			this.parameterGroup = this.defaultParamGroup;
			this.$emit('resetClicked');
		}
	},
	computed: {
		domesticOrPublic(){
			return this.type == 1  || this.type == 4 ? 'Domestic-supply' : this.type == 2  || this.type == 0 ? 'Public-supply' : 'Trends';
		},

		trendArr(){
			var arr = [];
			for(var i = 0; i < parseInt(this.trendVisits); i++){
				arr.push(i);
			}
			return arr;
		},
		
		/* CHECKME create the url string that will point the user to the folder to be downloaded */
		zipHref(){
			if(this.parameterGroup.groupName !== ""){
				var stringName = this.parameterGroup.groupName.replace(/\s/g, '');
				return './downloads/groups/'+ stringName + '.zip'
			}
		},

		sortedParameterGroups(){
			return this.infos.sort( (a, b) => {
				var nameA = a.groupName.toLowerCase();
				var nameB = b.groupName.toLowerCase();
				if (nameA < nameB) {
				    return -1;
				  }
				  if (nameA > nameB) {
				    return 1;
				  }
				  // names must be equal
				  return 0;
			})
		},

		sortedParameters(){
			return this.parameterGroup.parameters.sort( (a, b) => {
				var nameA = a.Constituent;
				var nameB = b.Constituent;
				if (nameA < nameB) {
				    return -1;
				  }
				  if (nameA > nameB) {
				    return 1;
				  }
				  // names must be equal
				  return 0;
			})
		}
	}
}
</script>


<style scoped>
#menu {
    top: 50px;
    right: 10px;
    font-size: 16px;
    overflow: auto;
    max-height: 100%;
    padding-right: 20px;
}
h2{
	font-size: 14px;
	font-weight: bold;
	margin: 0;
}

.form>div{
	margin: 10px 0px;
}
select{
	margin: 2px 0px;
	font-size: 16px;
	font-family: 'Calibri';
	width: 300px;
	background-color: #ebedee;
	border-radius: 3px;
	box-shadow: 1px 1px 5px grey;
}
select.highlighted{
	border: 2px solid #896FC3;
}

select:hover, input:hover{
	box-shadow: 1px 1px 10px grey;
	cursor: pointer;
	font-family: 'Calibri';
}
.labelDiv{
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	font-weight: bold;
}

.button{
	box-shadow: 1px 1px 5px grey;
	text-align: center;
	width: 100%;
	display: block;
	height: 40px;
	border-radius: 5px;
	border: 1px solid grey;
	cursor: pointer;
	text-decoration: none;
	/*background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);*/
	background: #D3CCE3;  /* fallback for old browsers */
	background: -webkit-linear-gradient(to right, #E9E4F0, #D3CCE3);  /* Chrome 10-25, Safari 5.1-6 */
	background: linear-gradient(to right, #E9E4F0, #D3CCE3); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
	margin: 0;
}
.button p{
	margin-top: 7px;
}
.button:not(.disabled):hover{
	box-shadow: 1px 1px 10px grey;
	width: 100%;
	height: 40px;
}
.button.disabled, #downloadButton.disabled{
	width: 100%;
	height: 40px;
	cursor: not-allowed;
	color: grey;
	background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
}

#reset{
	border-bottom: 1px solid grey;
}


#layerSelector>div.disabled>input{
	cursor: not-allowed;
}
#layerSelector>div.disabled>label{
	text-decoration: line-through;
	color: grey;
}
.small{
	font-size: 12px;
}
.small a{
	border-bottom: 1px solid #4278DA;
	height: 10px;
	line-height: 100%;
}
</style>