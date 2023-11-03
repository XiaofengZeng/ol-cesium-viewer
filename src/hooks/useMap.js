import { ref, unref } from 'vue'
import { Map, View } from 'ol'
import Tile from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import XYZ from 'ol/source/XYZ'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import OLCesium from '@/libs/olcs2.16.0/OlCesium'
import { Cesium3DTileset } from 'cesium'

import { olViewCfg } from '@/configs/map'
import { tdtURLs } from '@/configs/data'

/**
 * 加载GeoJSON数据
 * @param target
 * @param opt
 */
const fetchGeoJSON = async url => {
	return fetch(url)
		.then(response => {
			if (response.ok) {
				return response.text()
			} else {
				throw new Error('load GeoJSON failed!')
			}
		})
		.then(content => {
			return JSON.parse(content)
		})
		.catch(error => {
			console.error('There has been a problem with your fetch operation: ' + error.message)
		})
}

export default function useMap() {
	let map
	const enabled3d = ref(false)

	function initMap(el, opt) {
		const olMap = new Map({
			target: el,
			layers: tdtURLs.map(url => {
				return new Tile({
					source: new XYZ({
						url,
						wrapX: false,
					}),
				})
			}),
			view: new View({
				...olViewCfg,
			}),
		})

		map = new OLCesium({ map: olMap })
		set3dEnabled(opt.enable3DImmediately)
	}

	function getMap() {
		return map ?? undefined
	}

	function get3dEnabled() {
		return unref(enabled3d)
	}

	function set3dEnabled(v) {
		if (!map) {
			return
		}
		enabled3d.value = v
		map.setEnabled(v)
	}

	function loadGeojsonToOlMap(url, target, options) {
		fetchGeoJSON(url)
			.then(geojson => {
				const format = new GeoJSON()
				const feature = format.readFeatures(geojson)
				feature.forEach(f => {
					f.setStyle(
						new Style({
							fill: new Fill({
								color: [Math.random() * 255, Math.random() * 255, Math.random() * 255, 0.5],
							}),
							// FIXME: if has storke，will occur error when synchronize to Scene
							// stroke: new Stroke({
							// 	width: 3,
							// 	color: [0, 200, 0, 0.5],
							// }),
						})
					)
				})
				target.getSource().addFeatures(feature)
			})
			.catch(error => {
				console.error('There has been a problem with your fetch operation: ' + error.message)
			})
	}

	function load3DTilesetToCesiumScene(url, options) {
		Cesium3DTileset.fromUrl(url)
			.then(tileset => {
				// Custom properties
				if (!tileset.costomProps) {
					tileset.costomProps = {}
				}
				for (const key in options.properties) {
					if (Object.hasOwnProperty.call(options.properties, key)) {
						tileset.costomProps[key] = options.properties[key]
					}
				}
				map.getCesiumScene().primitives.add(tileset)
				options.flyTo && map.getCesiumViewer().flyTo(tileset)
			})
			.catch(error => {
				console.error(`Error loading tileset: ${error}`)
			})
	}

	function addLayerToMap(layer) {
		// avoid to add duplicated layer.
		let isExisting = false
		const layers = map.getOlMap().getAllLayers()
		layers.forEach(lyr => {
			if (layer == lyr) {
				isExisting = true
			}
		})
		if (!isExisting) {
			map.getOlMap().addLayer(layer)
		}
	}

	function removeOlMapLayer(layer) {
		map.getOlMap().removeLayer(layer)
	}

	function removeAllOlMapLayers() {
		const lyrs = map.getOlMap().getAllLayers()
		lyrs.forEach(layer => {
			layer.get('customProps') && removeOlMapLayer(layer)
		})
	}

	function removeCesiumScenePrimitive(primitive) {
		map.getCesiumScene().primitives.remove(primitive)
	}

	function removeAllCesiumScenePrimitives() {
		const primitives = map.getCesiumScene().primitives
		const length = primitives.length
		for (let i = 0; i < length; ++i) {
			const p = primitives.get(i)
			p.costomProps && removeCesiumScenePrimitive(p)
		}
	}

	function removeCesiumViewerEntity(entity) {
		map.getCesiumViewer().entities.remove(entity)
	}
	function removeAllCesiumViewerEntities() {
		map.getCesiumViewer().entities.removeAll()
	}

	function getOrCreateOlVectorLayer(lyrName) {
		let lyr = getOlLayerByName(lyrName)
		if (!lyr) {
			lyr = new VectorLayer({
				source: new VectorSource({ wrapX: false }),
				style: new Style({
					fill: new Fill({
						color: [0, 0, 0, 0.5],
					}),
					stroke: new Stroke({
						width: 3,
						color: [0, 200, 0, 0.5],
					}),
				}),
			})
			lyr.set('customProps', {
				lyrName,
			})
		}
		return lyr
	}

	function getOlLayerByName(lyrname) {
		return (
			map
				.getOlMap()
				.getAllLayers()
				.filter(e => {
					const costom = e.get('customProps')
					return costom && costom['lyrName'] === lyrname
				})[0] ?? null
		)
	}

	return {
		initMap,
		getMap,
		get3dEnabled,
		set3dEnabled,
		getOlLayerByName,
		loadGeojsonToOlMap,
		load3DTilesetToCesiumScene,
		getOrCreateOlVectorLayer,
		addLayerToMap,
		removeOlMapLayer,
		removeAllOlMapLayers,
		removeCesiumScenePrimitive,
		removeAllCesiumScenePrimitives,
		removeCesiumViewerEntity,
		removeAllCesiumViewerEntities,
	}
}
