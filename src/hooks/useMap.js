import { ref, unref } from 'vue'
import { Map, View } from 'ol'
import Tile from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import Fill from 'ol/style/Fill'
import { GeoJSON } from 'ol/format'
import OLCesium from '@/libs/olcs2.16.0/OlCesium'

import { tdtURLs, olViewCfg } from '@/configs/map'
import Style from 'ol/style/Style'
import { Cesium3DTileset } from 'cesium'

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
		removeOlMapLayer,
		removeAllOlMapLayers,
		removeCesiumScenePrimitive,
		removeAllCesiumScenePrimitives,
		removeCesiumViewerEntity,
		removeAllCesiumViewerEntities,
	}
}
