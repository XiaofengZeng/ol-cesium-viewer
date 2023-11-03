<script setup>
import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue'

import { OlDrawGeometryType } from '@/enums/ol'
import { CsDrawGeometryType } from '@/enums/cs'
import { OperationType } from '@/enums/system'

import { mapCfg } from '@/configs/map'
import { geojsonURLs, tilesetURLs } from '@/configs/data'
import useMap from '@/hooks/useMap'

const {
	initMap,
	getMap,
	get3dEnabled,
	set3dEnabled,
	getOrCreateOlVectorLayer,
	loadGeojsonToOlMap,
	load3DTilesetToCesiumScene,
	addLayerToMap,
	removeAllOlMapLayers,
	removeAllCesiumScenePrimitives,
	addOlDrawInteraction,
	removeOlDrawInteraction,
} = useMap()

let map
let draw2d
let draw2dLayer

const drawActivatedType = ref('')

const currentStatus = reactive({
	mode: mapCfg.enable3DImmediately,
	operation: OperationType.NONE,
})

const changeDimension = () => {
	if (draw2d) {
		removeOlDrawInteraction(draw2d)
		draw2d = undefined
	}
	const pre = get3dEnabled()
	const next = !pre
	map && set3dEnabled(next)

	updateStatus({
		mode: next,
		operation: OperationType.NONE,
	})
}

const reset = () => {
	if (currentStatus.mode) {
		removeAllCesiumScenePrimitives()
	} else {
		removeAllOlMapLayers()
		if (draw2d) {
			removeOlDrawInteraction(draw2d)
			draw2d = undefined
			drawActivatedType.value = ''
		}
	}
	updateStatus({
		operation: OperationType.NONE,
	})
}

const load2dData = () => {
	updateStatus({
		operation: OperationType.LOAD_2D_DATA,
	})
	const lyr = getOrCreateOlVectorLayer('temp_vector_layer')
	addLayerToMap(lyr)
	geojsonURLs.forEach(url => {
		loadGeojsonToOlMap(url, lyr)
	})
}

const load3dData = () => {
	updateStatus({
		operation: OperationType.LOAD_3D_DATA,
	})
	tilesetURLs.forEach(cfg => {
		load3DTilesetToCesiumScene(cfg.url, {
			properties: cfg.properties,
			flyTo: true,
		})
	})
}

const drawIn2d = () => {
	updateStatus({
		operation: OperationType.DRAW_2D,
	})
	draw2dLayer = getOrCreateOlVectorLayer('temp_draw_vector_layer')
	addLayerToMap(draw2dLayer)
	drawActivatedType.value = OlDrawGeometryType.LINE_STRING
}

const drawIn3d = () => {
	updateStatus({
		operation: OperationType.DRAW_3D,
	})
}

const updateStatus = status => {
	Object.assign(currentStatus, status)
}

const isDrawing = computed(() => {
	return currentStatus.operation == OperationType.DRAW_2D || currentStatus.operation == OperationType.DRAW_3D
})

const drawGeometryType = computed(() => {
	let type = {}
	switch (currentStatus.operation) {
		case OperationType.DRAW_2D:
			type = OlDrawGeometryType
			break
		case OperationType.DRAW_3D:
			type = CsDrawGeometryType
		default:
			break
	}
	return type
})

watch(drawActivatedType, nVal => {
	if (nVal) {
		draw2d = addOlDrawInteraction(nVal, draw2dLayer)
	}
})

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
				<el-button type="danger" class="w-full" @click="reset">重置</el-button>
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
		<el-row :gutter="10" class="m-[5px] p-[5px]">
			<el-select
				class="w-full ml-[5px] mr-[5px]"
				v-model="drawActivatedType"
				placeholder="Plase acitive draw operation."
				:disabled="!isDrawing">
				<el-option v-for="(value, index) in drawGeometryType" :key="index" :label="value" :value="value" />
			</el-select>
		</el-row>
	</div>
	<div id="map" class="w-full h-screen"></div>
</template>

<style scoped></style>
