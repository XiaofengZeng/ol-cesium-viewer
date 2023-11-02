import { ref, unref } from 'vue'
import { Map, View } from 'ol'
import Tile from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import OLCesium from '@/libs/olcs2.16.0/OlCesium'

import { olTdtLayers, olViewCfg } from '@/configs/map'

export default function useMap() {
	let map
	const enabled3d = ref(false)

	function initMap(el, opt) {
		const olMap = new Map({
			target: el,
			layers: olTdtLayers.map(url => {
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

	return { initMap, getMap, get3dEnabled, set3dEnabled }
}
