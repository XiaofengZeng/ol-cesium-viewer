<script setup>
import { reactive, computed, onMounted, nextTick } from 'vue'
import { mapCfg } from '@/configs/map'
import useMap from '@/hooks/useMap'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
// import Stroke from 'ol/style/Stroke'

import { geojsonURLs, tilesetURLs } from '@/configs/map'

const {
	initMap,
	getMap,
	get3dEnabled,
	set3dEnabled,
	getOlLayerByName,
	loadGeojsonToOlMap,
	load3DTilesetToCesiumScene,
	removeAllOlMapLayers,
	removeAllCesiumScenePrimitives,
} = useMap()

let map

const currentStatus = reactive({
	mode: mapCfg.enable3DImmediately,
	operation: '',
})

const changeDimension = () => {
	const pre = get3dEnabled()
	const next = !pre
	map && set3dEnabled(next)
	updateStatus({
		mode: next,
	})
}
const clearAllData = () => {
	if (currentStatus.mode) {
		removeAllCesiumScenePrimitives()
	} else {
		removeAllOlMapLayers()
	}
}
const load2dData = () => {
	updateStatus({
		operation: '加载二维数据',
	})
	let lyr = getOlLayerByName('temp_vector_layer')
	if (!lyr) {
		lyr = new VectorLayer({
			source: new VectorSource(),
			style: new Style({
				fill: new Fill({
					color: [0, 0, 0, 0.5],
				}),
				// FIXME: if has storke，will occur error when synchronize to Scene
				// stroke: new Stroke({
				// 	width: 1,
				// 	color: [200, 0, 0, 0.5],
				// }),
			}),
		})
		lyr.set('customProps', {
			lyrName: 'temp_vector_layer',
		})
		map.getOlMap().addLayer(lyr)
	}
	geojsonURLs.forEach(url => {
		loadGeojsonToOlMap(url, lyr)
	})
}
const load3dData = () => {
	updateStatus({
		operation: '加载三维数据',
	})
	tilesetURLs.forEach(cfg => {
		load3DTilesetToCesiumScene(cfg.url, {
			properties: cfg.properties,
			flyTo: true,
		})
	})
}
const drawIn2d = () => {}
const drawIn3d = () => {}

const updateStatus = status => {
	Object.assign(currentStatus, status)
}

onMounted(() => {
	window.addEventListener('resize', () => {
		map?.getOlMap && map.getOlMap().updateSize()
		map && map.getCesiumViewer().resize()
	})
	nextTick(() => {
		initMap('map', mapCfg)
		map = getMap()
	})
})
</script>

<template>
	<div class="fixed z-[999] w-[500px] top-[10px] left-[40px] bg-gray-500 rounded-md">
		<el-row :gutter="10" class="m-[5px] p-[5px]">
			<el-col :span="12" class="text-white">当前模式：{{ currentStatus.mode ? '三维' : '二维' }}</el-col>
			<el-col :span="12" class="text-white">当前功能：{{ currentStatus.operation }}</el-col>
		</el-row>
	</div>
	<div class="fixed z-[999] w-[250px] top-[10px] right-[10px]">
		<el-row :gutter="10" class="m-[5px] p-[5px]">
			<el-col :span="12">
				<el-button type="warning" class="w-full" @click="changeDimension">二/三维切换</el-button>
			</el-col>
			<el-col :span="12">
				<el-button type="danger" class="w-full" @click="clearAllData">清空数据</el-button>
			</el-col>
		</el-row>
		<el-row :gutter="10" class="m-[5px] p-[5px]">
			<el-col :span="12">
				<el-button type="primary" :disabled="currentStatus.mode" class="w-full" @click="load2dData"
					>二维数据加载</el-button
				>
			</el-col>
			<el-col :span="12">
				<el-button type="primary" :disabled="!currentStatus.mode" class="w-full" @click="load3dData"
					>三维数据加载</el-button
				>
			</el-col>
		</el-row>
		<el-row :gutter="10" class="m-[5px] p-[5px]">
			<el-col :span="12">
				<el-button type="primary" :disabled="currentStatus.mode" class="w-full" @click="drawIn2d">二维绘制</el-button>
			</el-col>
			<el-col :span="12">
				<el-button type="primary" :disabled="!currentStatus.mode" class="w-full" @click="drawIn3d">三维绘制</el-button>
			</el-col>
		</el-row>
	</div>
	<div id="map" class="w-full h-screen"></div>
</template>

<style scoped></style>
