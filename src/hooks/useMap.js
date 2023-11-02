import { ref, unref } from 'vue'
import { Map, View } from 'ol'
import Tile from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { GeoJSON } from 'ol/format'
import OLCesium from '@/libs/olcs2.16.0/OlCesium'

import { tdtURLs, olViewCfg } from '@/configs/map'

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

	async function loadGeojsonToOlMap(url, target, options) {
		fetchGeoJSON(url)
			.then(geojson => {
				const format = new GeoJSON()
				const feature = format.readFeatures(geojson)
				target.getSource().addFeatures(feature)
			})
			.catch(error => {
				console.error('There has been a problem with your fetch operation: ' + error.message)
			})
	}

	function getOlLayerByName(lyrname) {
		return (
			map
				.getOlMap()
				.getAllLayers()
				.filter(e => e.get('lyrName') === lyrname)[0] ?? null
		)
	}

	return {
		initMap,
		getMap,
		get3dEnabled,
		set3dEnabled,
		getOlLayerByName,
		loadGeojsonToOlMap,
	}
}
