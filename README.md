# ol-cesium-viewer

## Dependencies

- ol@8.1.0
- cesium@1.111.0
- olcs@2.16.0

## Modification about OLCesium

1. Added `viewer_` property to expose the Cesium Viewer instance.
2. Changed `canvas_` value to canvas element that in Cesium Viewer instance target element.
3. Changed `scene_` value to scene property that in Cesium Viewer instance.
4. Removed useless element in Cesium Viewer instance target element.

## Fixed/Attention issues

1. Dropped support for `KTX1` file since `cesium@1.83.0`
2. Fixed `olcs@2.16.0/OLCesium.js` style value about `fillArea` variable
