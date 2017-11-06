<template>
	<!-- get thresholds from thresholds table -->
	<div id='map_legend' class='leaflet-bar container' :class='{"min" : !showControls}'>

		<ToggleBar :show='showControls' @click='toggle'>
			<h2 slot='title' v-if='type == "" && param.value == "" && layers.length == 0'>Legend</h2>
		</ToggleBar>

		<div v-if='showControls' class='legendContent'>
		    <!-- Groundwater Study Type Legend -->
		    <!-- show if there's a value for the study type but no value for the param -->
		    <div v-if='type != "" && param.value == ""' id="mainLayerLegend" class='subLegend'>
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
		    <!-- ph -->
		    <legendContent v-if='param.value == 31' class='paramLayerLegend hasInfo '>
				<h3 slot='h3'>{{param.name}} ({{param.units}})</h3>
				<p slot='cat1'>Basic</p>
				<div slot='img1'>
					<img src='../assets/images/ph.png'/>
					<p>{{thresh.Hi_Thresh}}</p>
				</div>
				<p slot='cat2'></p>
				<div slot='img2'>
					<img src='../assets/images/low.png'/>
					<p>{{thresh.Mod_Thresh}}</p>
				</div>
				<p slot='cat3'>Acidic</p>
				<div slot='img3'>
					<img src='../assets/images/hi.png'/>
					<p>{{thresh.Low_Thresh}}</p>
				</div>
				<div slot='benchmark'>
					<p> {{thresh.ThresholdSource}} </p>
					<img src='../assets/images/moreInfo.png' :alt='thresh.ThresholdDetail' :title='thresh.ThresholdDetail' />
				</div>
		    </legendContent>


		    <!-- detects. the values of all paramaters that are measured by number of detections should be in this array -->
		    <div class="paramLayerLegend detects" v-if='param.units === "Number of Detections"'>
		    	<h3>{{param.name}}</h3>
		    	<div><p>Number of Detects</p><p>Symbology</p></div>
		    	<div>
		    		<p>>3</p>
		    		<div>
		    			<img src='../assets/images/hi.png'/>
		    		</div>
		    	</div>
		    	<div>
		    		<p>2-3</p>
		    		<div>
		    			<img src='../assets/images/mod.png'/>
		    		</div>
		    	</div>
		    	<div>
		    		<p>1</p>
		    		<div>
		    			<img src='../assets/images/low.png'/>
		    		</div>
		    	</div>
		    	<div>
		    		<p>None</p>
		    		<div>
		    			<img src='../assets/images/zero.png'/>
		    		</div>
		    	</div>
		    </div>

		    <!-- main -->
		    <div class="paramLayerLegend hasInfo" v-if='param.units !== "Number of Detections" && param.value !== "" && param.value !== 31'>
		    	<h3>{{param.name}} <span v-if='param.units'>({{param.units}})</span></h3>
		    	<div><p>Category</p><p>Symbology</p></div>
		    	<div><p>High</p><div><img src='../assets/images/hi.png'/><p>{{thresh.Hi_Thresh}}</p></div></div>
		    	<div><p>Moderate</p><div><img src='../assets/images/mod.png'/><p>{{thresh.Mod_Thresh}}</p></div></div>
		    	<div>
		    		<p>Low</p>
		    		<div>
		    			<img src='../assets/images/low.png'/>
		    			<p>{{thresh.Low_Thresh}}</p>
		    		</div>
		    	</div>
		    	<div>
		    		<p>Benchmark:</p>
		    		<div>
		    			<p> {{thresh.ThresholdSource}} </p>
		    			<img src='../assets/images/moreInfo.png' :alt='thresh.ThresholdDetail' :title='thresh.ThresholdDetail' />
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
import legendContent from './legendContent.vue'
import listOfUnits from '../assets/listOfUnits.js'
import listOfProvinces from '../assets/listOfProvinces.js'

export default {
	name: 'LegendDiv',
	data(){
		return {
			listOfUnits: listOfUnits,
			listOfProvinces: listOfProvinces
		}
	},
	props: ['layers', 'type', 'param',  'thresh'],
	components: {
		ToggleBar, legendContent
	},
	mixins: [toggle]
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
.paramLayerLegend.hasInfo>div>p:first-child{
	text-align: left;
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