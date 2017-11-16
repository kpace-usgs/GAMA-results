# GAMA - Priority Basin Project Water-Quality Results
![screenshot](./screenshot.png)


## Setup
This is a [vue](vuejs.org) project that generates a static page from Vue components. There are two environments, defined in the build/ folder and run from the script defined in package.json. run ```npm run dev``` for the dev environment, which is served at localhost:8080 and hot reloads, or ```npm run build``` to build the static files in the dist/ folder.


The app's structure beings in src/app.vue. Global libraries are defined in src/main.js, including an Es6Promise polyfill to make Promises work with IE. The app.vue file coordinates passing data between the map, the menu, and the legend components. It also registers the mixins/toggle.vue component, which watches the size of the screen and will toggle the menu and legend to smaller sizes should the screen fall below a threshold number of pixels.

The components of the app are all within the components/ folder. The mapDiv.vue component is the most complicated component, clearing the map's layers and calling mixin functions depending on what values have been selected in the menu. 

The requests to the arcServer are managed in the file mixins/getData.vue. This file defines the possible endpoints and returns esri.dynamicMapLayers to the mapDiv component. The mapDiv component then manages adding and removing the layers from L.featureGroups.

Functions that build the popup content are housed in mixins/getTrendPopup and mixins/getParamPopup and mixins/buildTrendGraph


## Flow

When the app is mounted, App.vue makes a request to ArcServer (line 97) that returns all the data about each parameter's thresholds and benchmarks and constituent groups. This information is massaged (clunkily - the function could definitely be improved) into an array of objects that is passed to both the menu component and the legend component.

The menu then fills the drop-downs with the groupName values and all the parameters within each groupName. When the parameter is changed in the menu, the legend updates with that parameter's data.

The point of doing it this was is to avoid if-statements for different kinds of constituents and instead just let the arcserver table handle everything, but the arcserver table doesn't account for constituents that are counted by number of detects rather than concentration values.





TODO: 
- fix polygon layer numbers
- add style for point L.geoJSONs 
- when this.buildTrendLayer() is called in mapDiv.vue, filter the layer by this.trendIndex()
- trend popup doesn't have to run separate query
- populate trend options from the server instead of being hand-coded into menu and map logic (in getData.vue and buildDefs.js). Instead on mount the app component should get unique StudyType values and use those to fill in the map and the logic.
- layering order of results with no detects or domestic well types 
