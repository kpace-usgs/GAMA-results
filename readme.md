# GAMA - Priority Basin Project Water-Quality Results
![screenshot](./screenshot.png)


This is a [vue](vuejs.org) project that generates a static page from Vue components. There are two environments, defined in the build/ folder and run from the script defined in package.json. run ```npm run dev``` for the dev environment, which is served at localhost:8080 and hot reloads, or ```npm run build``` to build the static files in the dist/ folder.

The app's structure beings in src/app.vue. Global libraries are defined in src/main.js, including an Es6Promise polyfill to make Promises work with IE. The app.vue file coordinates passing data between the map, the menu, and the legend components. It also registers the mixins/toggle.vue component, which watches the size of the screen and will toggle the menu and legend to smaller sizes should the screen fall below a threshold number of pixels.

The components of the app are all within the components/ folder. The mapDiv.vue component is the most complicated component, clearing the map's layers and calling mixin functions depending on what values have been selected in the menu. 

The requests to the arcServer are managed in the file mixins/getParamData.vue. This file defines the possible endpoints and returns esri.dynamicMapLayers to the mapDiv component. The mapDiv component then manages adding and removing the layers from L.featureGroups.

The following mixins are not being used as rendering is now coming from arcServer, but I left them in there in case we want to use them in the future, should we move away from arcServer
- wellIcons.js



User Stories:
- User selects "Public trends sites", "VOCs", and "Trihalomethanes". Because this.param is the last variable to be changed, this.importParam() is called. The paramLayer will be filtered by StudyType === public-supply (line 63 of getParamData.vue)

- User selects "VOCs", "Trihalomethanes", and "Public trends sites". Because this.type is the last variable to be changed, the paramLayer will be filtered by purpose === status and study-type == public-supply (line 66 of mapDiv.vue)

- User selects "Public trends sites". this.wellsByType() is called. this.importTypeJson(0) gets all trends sites and is filtered by studyType = Public=supply
