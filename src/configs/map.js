const tdtToken = '20a24b65d7901cf54d9bd05843e70f5b'

export const olTdtLayers = [
	`https://t3.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tdtToken}`,
	`https://t3.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tdtToken}`,
]

export const olViewCfg = {
	projection: 'EPSG:4326',
	center: [114.064839, 22.548857],
	minZoom: 8,
	maxZoom: 19,
	zoom: 12,
}

export const mapCfg = {
	has3DMode: true,
	enable3DImmediately: false,
}
