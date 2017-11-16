<template>
	<!-- get thresholds from thresholds table -->
	<div id='map_legend' class='leaflet-bar container' :class='{"min" : !showControls}'>

		<ToggleBar :show='showControls' @click='toggle'>
			<h2 slot='title' v-if='type == "" && param.PCODE == "" && layers.length == 0'>Legend</h2>
		</ToggleBar>

		<div v-if='showControls' class='legendContent'>
		    <!-- Groundwater Study Type Legend -->
		    <!-- show if there's a value for the study type but no value for the param -->
		    <div v-if='type != "" && param.PCODE == ""' id="mainLayerLegend" class='subLegend'>
		    	<h3 style='font-weight: bold;'>Groundwater Study Type</h3>
		        <div v-if='type == 0 || type == 3 || type == 4'>
					<img src="../assets/images/trends_new.png"/>
					<p>GAMA Trends Sites</p>
				</div>
				<div v-if='type == 1 || type == 3'>
		        	<img src="../assets/images/shallow.png"/>
		        	<p>GAMA Domestic-supply Aquifer Sites</p>
		        </div>
		        <div v-if='type == 2 || type == 3'>
		        	<img src="../assets/images/deep.png"/>
		        	<p>GAMA Public-supply Aquifer Sites</p>
		        </div>
		    </div>

		    <!-- Parameter Legend -->
			<div v-if='param.PCODE !== ""' class='paramLayerLegend hasInfo'>
				<h3>{{param.Constituent}}
					<span v-if='param.Units' >({{param.Units}})</span>
				</h3>

				<div>
					<!-- add table header here -->
					<p v-if='param.Units'>Category</p>
					<p v-else>Number of Detects</p>
					<p>Symbology</p>
				</div>
				<div v-for='legend in param.Legend'>
					<p>{{legend.Category}}</p>
					<div>
						<i :style='{background: getColor(legend.LegendItem), width: "8px", height: "8px", borderRadius: "7px", border: "1px solid black", marginRight: "5px"}'></i>
						<p>{{legend.Symbology}}</p>
					</div>
				</div>
				<div>
					<p>Benchmark:</p>
					<div>
						<p> {{param.BenchmarkType}} </p>
						<img src='../assets/images/moreInfo.png' :alt='param.BenchmarkDefinition' :title='param.BenchmarkDefinition' />
					</div>
				</div>
			</div>


		    <!-- Shapefiles Legend -->
		    <div id="extraLayerLegend" style="max-height:300px;overflow:auto;">
		    	<div v-if='layers.includes(0)' class='subLegend'>
			    	<h3>Domestic-supply Aquifer Grid Cells</h3>
			     	<div>
			     		<div style="border:1px solid rgb(078,078,078);"></div>
			        </div>
			    </div>

				<div v-if='layers.includes(1)' class='subLegend'>
			    	<h3>Public-supply Aquifer Grid Cells</h3>
			     	<div>
			     		<div style="border:1px solid black;"></div>
			        </div>
			    </div>

				<div v-if='layers.includes(2)' class='subLegend'>
			    	<h3>Domestic-supply Aquifers <br/>Study Unit Boundaries</h3>
			     	<div>
			     		<div style="background-color:#9c8a5a;"></div>
			     		<p>Madera-Chowchilla and Kings basins</p>
			        </div>
			        <div>
			        	<div style="background-color:#bda621;"></div>
			        	<p>Monterey Bay and Salinas Valley basins and adjacent watersheds</p>
			        </div>
			        <div>
			        	<div style="background-color:#ce7952;"></div>
			        	<p>North San Francisco Bay basins and adjacent watersheds</p>
			        </div>
			        <div>
			        	<div style="background-color:#7b9a84;"></div>
			        	<p>Kaweah, Tule, and Tulare Lake basins and adjacent watersheds</p>
			        </div>
			        <div>
			        	<div style="background-color:#a54100;"></div>
			        	<p>Yuba and Bear River watersheds</p>
			        </div>
			    </div>

				<div v-if='layers.includes(3)' class="subLegend">
					<h3>Public-supply Aquifers <br/>Study Unit Boundaries</h3>
					<div v-for='unit in listOfUnits'>
						<div :style="{backgroundColor: unit.color}"></div>
						<p>{{unit.name}}</p>
					</div>
				</div>	

		  		<div v-if='layers.includes(4)' class="subLegend">
		  			<h3>Hydrogeologic Provinces</h3>
		  			<div v-for='unit in listOfProvinces'>
						<div :style="{backgroundColor: unit.color}"></div>
						<p>{{unit.name}}</p>
					</div>
		  		</div>
		    </div>
		 </div>
	</div>
</template>

<script>
import toggle from '../mixins/toggle.vue'
import ToggleBar from './toggleBar.vue';
import listOfUnits from '../assets/listOfUnits.js'
import listOfProvinces from '../assets/listOfProvinces.js'
import * as wellColor from '../mixins/wellColor.js';

export default {
	name: 'LegendDiv',
	data(){
		return {
			listOfUnits: listOfUnits,
			listOfProvinces: listOfProvinces
		}
	},
	props: ['layers', 'type', 'param'],
	components: {
		ToggleBar
	},
	mixins: [toggle],
	methods: {
		getColor(legendItem) {
			return legendItem == 3 ? wellColor.low : legendItem == 1 ? wellColor.hi : legendItem == 4 ? wellColor.none : wellColor.med;
		}
	}
}
</script>


<style >
.paramLayerLegend>div{
	display: flex;
	width: 100%;
	justify-content: space-between;
	padding: 0;
}
.paramLayerLegend h3{
	font-weight: 700;
}


/* align the text to the center for number of detects constituents */
.paramLayerLegend.detects>div>p{
	text-align: center;
}
.paramLayerLegend.detects>div>div{
	justify-content: center;
}


.paramLayerLegend>div:nth-child(2){
	border-bottom: 1px solid grey;
}

/* styling for the word "symbology" */
.paramLayerLegend>div>p{
	width: 100%;
	margin: 0;
	text-align: left;
	font-size: 16px;
	word-break: keep-all;
}

/* for legend entries with info about the benchmark source */
.paramLayerLegend.hasInfo>div:last-child>div>img{
	margin-left: auto;
}

/* styling for items on left side of table */
.paramLayerLegend.hasInfo>div>p:first-child{
	text-align: right;
	padding-right: 20px;
	width: 100%;
}

.paramLayerLegend>div>div{
	display: flex;
	padding: 0;
	align-items: center;
	justify-content: flex-start;
	width: 100%;
	word-break: keep-all;
}
.paramLayerLegend>div>div>p{
	margin: 0 0 0 3px;
}
.legendContent h3{
	margin-top: -20px;
	width: 80%;
}
.subLegend>div{
	display: flex;
	align-items: baseline;
	align-content: flex-end;
}
.subLegend>div>img{
	margin-right: 20px;
}
.subLegend>div>p{
	margin: 0;
	font-size: 16px;
}
.subLegend>div>div{
	height:15px;
	margin-right: 20px;
	flex: 0 0 15px;
}
#map_legend{
	bottom: 50px;
	left: 10px;
	width: 100%;
	max-width: 200px;
}
#map_legend.min{
	width: 60%;
	max-width: 110px;
}

.leaflet-bar{
    background-color:white;
}

.leaflet-control-container{
	font-family: 'Calibri', 'Hevetica Neue', sans-serif;
	font-size: 16px;
}

</style>