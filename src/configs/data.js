const tdtToken = '20a24b65d7901cf54d9bd05843e70f5b'

export const tdtURLs = [
	`https://t3.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tdtToken}`,
	`https://t3.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tdtToken}`,
]

export const geojsonURLs = [
	/**
	 * Guangdong Province
	 */
	// 'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=440000_full',
	/**
	 * Xian City
	 */
	'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=610102',
	'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=610103',
	'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=610104',
	'https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=610113',
]

export const tilesetURLs = [
	{
		url: 'http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json',
		properties: {
			name: 'dayata',
		},
	},
]
