import esri from 'esri-leaflet'
import 'esri-leaflet-renderers'

function getLayer(defs, url, value) {
	/* request dynamic map layer from esri according to which url value has been set to this.url. this.type lives in whatever component this is registered as a mixin (for this project, the mapDiv.vue component) */
	/* import data and bind popup */
	return esri.dynamicMapLayer({
		url: url,
		layers: [value],
		layerDefs: defs
	});
};

function getData(url) {
	return esri.find({
		url: url
	});
};

function getTable(url){
	return esri.query({
		url: url
	});
};

function getPane(url, value){
	return esri.dynamicMapLayer({
		url: url, 
		layers: [value],
		minZoom: 4,
		position: value == 4 ? 'back' : 'front'
	});
};

export { getLayer, getData, getTable, getPane };