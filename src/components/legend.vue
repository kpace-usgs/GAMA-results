<template>
	<div id='map_legend' class='leaflet-bar container'>

		<ToggleBar :show='showControls' @click='toggle'></ToggleBar>

		<div v-if='showControls'>
		    <!-- Groundwater Study Type Legend -->
		    <div v-if='type.length > 0 && param == ""' id="mainLayerLegend" class='subLegend'>
		    	<h3 v-if='type.includes("0")'>All GAMA Sites</h3>
		        <div v-if='type.includes("1") || type.includes("0") || type == 4'>
					<img src="../assets/images/trends.png"/>
					<p>GAMA Trends Sites</p>
				</div>
				<div v-if='type.includes("2") || type.includes("0")'>
		        	<img src="../assets/images/shallow.png"/>
		        	<p>GAMA Domestic-supply Aquifer Sites</p>
		        </div>
		        <div v-if='type.includes("3") || type.includes("0")'>
		        	<img src="../assets/images/deep.png"/>
		        	<p>GAMA Public-supply Aquifer Sites</p>
		        </div>
		    </div>

		    <!-- Parameter Legend -->
		    <!-- ph -->
		    <div class="paramLayerLegend hasInfo" v-if='param.value == 31'>
		    	<h3>{{param.name}} ({{param.units}})</h3>
		    	<div><p>Benchmark</p><p>Symbology</p></div>
		    	<div><p>Basic</p><div><img src='../assets/images/ph.png'/><p>{{param.high}}</p></div></div>
		    	<div><p></p><div><img src='../assets/images/low.png'/><p>{{param.mod}}</p></div></div>
		    	<div><p>Acidic</p><div><img src='../assets/images/hi.png'/><p>{{param.low}}</p></div></div>
		    	<div><p>Benchmark:</p><div><p> {{param.thresh_val}} {{param.thresh_src}}</p><img src='../assets/images/moreInfo.png' :alt='param.acr' :title='param.acr' /></div></div>
		    </div>

		    <!-- detects -->
		    <div class="paramLayerLegend detects" v-if='[100].includes(param.value)'>
		    	<h3>{{param.name}}</h3>
		    	<div><p># Detects</p></div>
		    	<div><p>>3</p><div><img src='../assets/images/hi.png'/><p>{{param.high}}</p></div></div>
		    	<div><p>2-3</p><div><img src='../assets/images/mod.png'/><p>{{param.mod}}</p></div></div>
		    	<div><p>1</p><div><img src='../assets/images/low.png'/><p>{{param.low}}</p></div></div>
		    	<div><p>0 or null</p><div><img src='../assets/images/zero.png'/></div></div>
		    </div>

		    <!-- main -->
		    <div class="paramLayerLegend hasInfo" v-if='param.value != 31 && param.hasOwnProperty("value")'>
		    	<h3>{{param.name}} ({{param.units}})</h3>
		    	<div><p>Benchmark</p><p>Symbology</p></div>
		    	<div><p>High</p><div><img src='../assets/images/hi.png'/><p>{{param.high}}</p></div></div>
		    	<div><p>Moderate</p><div><img src='../assets/images/mod.png'/><p>{{param.mod}}</p></div></div>
		    	<div>
		    		<p>Low</p>
		    		<div>
		    			<img src='../assets/images/low.png'/>
		    			<p>{{param.low}}</p>
		    		</div>
		    	</div>
		    	<div v-if='param.hasOwnProperty("thresh_val")'>
		    		<p>Benchmark:</p>
		    		<div>
		    			<p> {{param.thresh_val}} {{param.thresh_src}}</p>
		    			<img src='../assets/images/moreInfo.png' :alt='param.acr' :title='param.acr' />
		    		</div>
		    	</div>
		    	<div v-else>
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
					<div>
						<div style="background-color:#ffcd66"></div>
						<p>Antelope Valley</p>
					</div>
					<div>
						<div style="background-color:#c9d25a;"></div>
						<p>Bear Valley & Lake Arrowhead watershed</p>
					</div>
					<div>
						<div style="background-color:#bee8ff;"></div>
						<p>Cascade Range & Modoc Plateau</p>
					</div>
					<div>
						<div style="background-color:#946100;"></div>
						<p>Central Eastside San Joaquin Valley</p>
					</div>
					<div>
						<div style="background-color:#5360a6;"></div>
						<p>Coastal Los Angeles basins</p>
					</div>
					<div>
						<div style="background-color:#886f45;"></div>
						<p>Borrego, Central Desert, and other desert basins</p>
					</div>
					<div>
						<div style="background-color:#9fa9d7;"></div>
						<p>Colorado River Valley</p>
					</div>
					<div>
						<div style="background-color:#7b639a;"></div>
						<p>Central Sierra Nevada</p>
					</div>
					<div>
						<div style="background-color:#87a06c;"></div>
						<p>Coachella Valley</p>
					</div>
					<div>
						<div style="background-color:#5d008c;"></div>
						<p>Santa Cruz Mtns & San Gabriel Mtns & Peninsular Ranges</p>
					</div>
					<div>
						<div style="background-color:#a88130;"></div>
						<p>Southeast San Joaquin Valley</p>
					</div>
					<div>
						<div style="background-color:#e1d3b4;"></div>
						<p>Kern basin</p>
					</div>
					<div>
						<div style="background-color:#b87272;"></div>
						<p>Klamath Mountains</p>
					</div>
					<div>
						<div style="background-color:#823d3d;"></div>
						<p>Mojave Valley</p>
					</div>
					<div>
						<div style="background-color:#90d96b;"></div>
						<p>Middle Sacramento Valley</p>
					</div>
					<div>
						<div style="background-color:#ffffbe;"></div>
						<p>Madera-Chowchilla basins</p>
					</div>

					<div>
						<div style="background-color:#7d87a6;"></div>
						<p>Monterey Bay and Salinas Valley basins</p>
					</div>

					<div>
						<div style="background-color:#c98282;"></div>
						<p>Northern San Joaquin Valley</p>
					</div>

					<div>
						<div style="background-color:#a1a3e6;"></div>
						<p>North San Francisco Bay basins</p>
					</div>

					<div>
						<div style="background-color:#698c00;"></div>
						<p>Northern Coast Ranges basins</p>
					</div>
					<div>
						<div style="background-color:#e6cfa1;"></div>
						<p>Owens & Indian Wells Valleys</p>
					</div>
					<div>
						<div style="background-color:#558c7b;"></div>
						<p>Northern Sacramento Valley</p>
					</div>

					<div>
						<div style="background-color:#ffa900; "></div>
						<p>Santa Maria R., San Antonio Ck., and Santa Ynez R. Valleys</p>
					</div>

					<div>
						<div style="background-color:#74a000;"></div>
						<p>Livermore, Gilroy-Hollister, and Cuyama Valleys</p>
					</div>
					<div>
						<div style="background-color:#90badd;"></div>
						<p>South and East San Francisco Bay basins</p>
					</div>
					<div>
						<div style="background-color:#c2f3c2;"></div>
						<p>Sierra Nevada Regional</p>
					</div>
				
					<div>
						<div style=""></div>
						<p>Southern Sacramento Valley</p>
					</div>
					<div>
						<div style="background-color:#ffffd9;"></div>
						<p>San Diego region</p>
					</div>
					<div>
						<div style="background-color:#247400;"></div>
						<p>Santa Barbara area basins</p>
					</div>
					<div>
						<div style="background-color:#517f4d;"></div>
						<p>Southern Sierra Nevada</p>
					</div>
					<div>
						<div style="background-color:#7f5f00;"></div>
						<p>Lake Tahoe and Martis Valley watersheds</p>
					</div>
					<div>
						<div style="background-color:#ffbe00;"></div>
						<p>San Gabriel & San Fernando Valleys</p>
					</div>
					<div>
						<div style="background-color:#66ceab;"></div>
						<p>Upper Santa Ana Watershed basins</p>
					</div>
					<div>
						<div style="background-color:#ff6c19;"></div>
						<p>Santa Clara River Valley basins</p>
					</div>
					<div>
						<div style="background-color:#475a96;"></div>
						<p>Western San Joaquin Valley</p>
					</div>
				</div>	

		  		<div v-if='layers.includes(4)' class="subLegend">
		  			<h3>Hydrogeologic Provinces</h3>
		  			<div>
		  				<div style="background-color:#bf8d56; "></div>
		  				<p>Basin and Range</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#95a894; "></div>
		  				<p>Central Valley</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#d1c478;"></div>
		  				<p>Desert</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#9c8aaa;"></div>
		  				<p>Klamath Mountains</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#b46772;"></div>
		  				<p>Modoc Plateu and Cascades</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#6fb0a3;"></div>
		  				<p>Northern Coast Ranges</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#ac7c7d;"></div>
		  				<p>San Diego</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#669a66; "></div>
		  				<p>Sierra Nevada</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#b8c1e0;"></div>
		  				<p>Southern Cal Islands (Group)</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#858b9c;"></div>
		  				<p>Southern Coast Ranges</p>
		  			</div>
		  			<div>
		  				<div style="background-color:#ba898a;"></div>
		  				<p>Transverse and Selected Peninsular Range</p>
		  			</div>
		  	
		  		</div>
		    </div>
		 </div>
	</div>
</template>

<script>
import toggle from '../mixins/toggle.vue'
import ToggleBar from './toggleBar.vue';

export default {
	name: 'LegendDiv',
	props: ['layers', 'type', 'param'],
	mixins: [toggle],
	components: {
		ToggleBar
	}
}
</script>


<style scoped>

.subLegend>div{
	display: flex;
	align-items: flex-start;
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

.paramLayerLegend>div{
	display: flex;
	width: 100%;
	justify-content: space-between;
	padding: 0;
}
.paramLayerLegend h3{
	font-weight: 700;
}
.paramLayerLegend>div:nth-child(2){
	border-bottom: 1px solid grey;
}
.paramLayerLegend.hasInfo>div:last-child>div>img{
	margin-left: auto;
}
.paramLayerLegend>div>p{
	width: 100%;
	margin: 0;
	text-align: left;
	font-size: 16px;
	word-break: keep-all;
}
.paramLayerLegend.hasInfo>div>p:first-child{
	text-align: left;
	padding-right: 20px;
	width: 100%;
}
.paramLayerLegend.detects>div{
	width: 90%;
	text-align: center;
}
.paramLayerLegend.detects>div>p{
	width: 100%;
	text-align: center;
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

</style>