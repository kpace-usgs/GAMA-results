# GAMA - Priority Basin Project Water-Quality Results
![screenshot](./screenshot.png)


## Setup
This is a [vue](vuejs.org) project that generates a static page from Vue components. There are two environments, defined in the build/ folder and run from the script defined in package.json. run ```npm run dev``` for the dev environment, which is served at localhost:8080 and hot reloads, or ```npm run build``` to build the static files in the dist/ folder.


The app's structure beings in src/app.vue. Global libraries are defined in src/main.js, including an Es6Promise polyfill to make Promises work with IE. The app.vue file coordinates passing data between the map, the menu, and the legend components. It also registers the mixins/toggle.vue component, which watches the size of the screen and will toggle the menu and legend to smaller sizes should the screen fall below a threshold number of pixels.

The components of the app are all within the components/ folder. The mapDiv.vue component is the most complicated component, clearing the map's layers and calling mixin functions depending on what values have been selected in the menu. 

The requests to the arcServer are managed in the file mixins/getData.vue. This file defines the possible endpoints and returns esri.dynamicMapLayers to the mapDiv component. The mapDiv component then manages adding and removing the layers from L.featureGroups. App.vue also has an endpoint so if you're changing the endpoint to be used, update both getData as well as App.vue.

Functions that build the popup content are housed in mixins/getTrendPopup and mixins/getParamPopup and mixins/buildTrendGraph


## Flow

When the app is mounted, App.vue makes a request to ArcServer (line 97) that returns all the data about each parameter's thresholds and benchmarks and constituent groups. This information is massaged (clunkily - the function could definitely be improved) into an array of objects that is passed to both the menu component and the legend component.

The menu then fills the drop-downs with the groupName values and all the parameters within each groupName. When the parameter is changed in the menu, the legend updates with that parameter's data and the mapDiv responds with the appropriate change to the map, be it downloading new data from the server or filtering the existing feature collection.



## Components and Mixins

### App.vue

This is the container for all the website's pieces. It connects the map with the menu and legend and controls when the loader icon will show.

A template of the app's state variables is given in the data() object on lines 42-68. 

On mounting, the app makes a request to the url saved in this.urlForData(). The resulting array of features gets transformed into a json in the function makeInfosArr, which arranges the features so that they are grouped by shared constituent classes. This structure is needed by the menu. If the field names get changed on the server, strings will have to be updated in this function (lines 116 - 198). 




### Menu.vue

Toggle Bar component to handle toggling menu size. Because the Legend needs the same functionality, I extracted the toggle bar to its own component: toggleBar.vue.

When the toggleBar has set this.showControls to true, the rest of the menu content shows. There are 6 sections to the menu. They control the type, the constituent class, the constituent, the trend visit number (aka trendIndex), polygon layers, and buttons.

- Groundwater Study Type: These are actually hand-coded options. Ideally they would be a list of unique StudyType values from the server, but the logic of the map is so dependent on the associated value that I didn't know how to make the map work without explicitely specifying which value (0-4) goes with which string. The drop-down menu is tied to the data variable this.type. When it is changed, lines 248-263 run. This code affects which polygon options are shown in the layer section and can reset the parameterGroup and the trendIndex. Finally, the change is emitted to the app and gets passed to the map and legend.

- Constituent Class: This drop-down is populated with every groupName string in the infos array that gets passed from the app.vue to the menu. The infos array first gets sorted by the sortedParameterGroups computed variable. The drop-down is attached to the data variable this.paramGroup. Changing this.paramGroup changes which constituents are listed in the constituent drop-down. If the paramGroup is reset back to a blank string (as when the study type changes before a constituent is selected), then the trendIndex is also reset. If no constituent and no constituent class have been selected, the select box will be highlighted with a purple border to indicate that the user needs to make a selection.

- Constituent: The parameters object of the selected parameterGroup is looped through to create one option per parameter object within that group. The entire parameter object gets passed to the state variable this.param. When changed, the new value gets emitted to the app, the legend, and the map.

- TrendIndex: A 3rd-party library Vue-Slider that is only shown when the prop trendVisits is not null or blank. The TrendVisits value is passed to the menu from the map once a trend layer has been loaded. The interval is set by the computed variable this.trendArr, which adds an integer to an array from 0 to the trendVisits number. So, if a constituent has had a max number of 4 trend visits, the slider will show 0 - 3. When the value of trendIndex gets changed, the value will only be emitted to the map if the menu has a trendVisits value. Otherwise the change would be from resetting the map or changing the study type to a trend type, and emitting the change would be premature.

- Layers: An array that when changed determines which polygon layers get loaded as dynamicMapLayers from the server. The study type determines which options get shown so that i "public-supply trends sites" is selected, the user won't see options to load "domestic-supply grid cells".

- buttons: A button to download a zip file of pre-built data for the selected constituent class, and a button to reset the map. Resetting the map calls function 'reset' on line 284. The href of the download link is generated by the zipHref variable on lines 307-312 and is based on the constituent class's groupName string.




### MapDiv.vue 

Initializes a Leaflet map and controls which layers are shown. Gets param, type, trend, layer, reset, and trendIndex variables from the app.vue. Watches for changes to trendIndex, type, param, layerArr, and watches for the reset button to be clicked. Depending on the contents of those variables, functions to build layers are called.

The build functions are passed a feature collection that they add to an L.geoJSON. the feature collection is either queried from the server in the mixin getData.vue, or it has already been loaded and saved to local state variable this.fc. 

Layers are built according to whether the type is a trend type or a sites type. A trend layer has extra content in its popup and includes a function countTrendVisits() (line 245) that is responsible for counting the number of trend visits the selected constituent has ever had and returning that number to the menu so the slider bar can have the correct number of intervals. 

Both types of layers are styled by the pointStyle.vue mixin.


#### getData.vue 

A mixin that has access to the state variables and functions of MapDiv.vue. Gets the correct feature collection or layer from the arcserver services.

In the buildData() method, I want to include a SQL query string built by the buildDef() function, but I haven't figured out how to include that on an esri-leaflet find() object. Instead, the function returns all entries where the PCode matches the selected constituent's PCODE, and the L.geoJSON in mapDiv.vue gets further filtered. It makes the initial load time longer for each constituent but filtering different types of that constituent faster.


#### Popup.vue

A mixin that has access to the state variables and functions of MapDiv.vue. The L.geoJSON layer calls either returnParamPopup() or returnTrendPopup() when a well is clicked. The elements saved to the state get cleared, filled with the correct string and, if a trend, graph, and the container element is returned to the layer as the popup content.

In the case of a trend layer, a chart.js chart is built by the functions buildGraph() and createChart(). buildGraph() assembles the data from the feature collection into the correct format to pass to the chart.js object. The chart.js object is assembed in createChart().


#### pointStyle.vue

A mixin that has access to the state variables and functions of MapDiv.vue. Returns a L.circleMarker with the color set as a result of comparing the well's LabValue to the parameter's threshold values. The threshold values are consistently inconsistent across parameters, but parameters of the type "number of detections" rather than "concentrations" will look to the category column, while the concentration type will look to the Threshold_Low.

The legendItem on the same row as each color in the server determines whether that color will be used for low, medium, or high results, because the final legendItem (where legendItem equals the total legend count, e.g. 3 out of 3) is consistently the low value.