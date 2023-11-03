export const OlGeometryType = {
	POINT: 'Point',
	LINE_STRING: 'LineString',
	LINEAR_RING: 'LinearRing',
	POLYGON: 'Polygon',
	MULTI_POINT: 'MultiPoint',
	MULTILINE_STRING: 'MultiLineString',
	MULTI_POLYGON: 'Multi',
	GEOMETRY_COLLECTION: 'GeometryCollection',
	CIRCLE: 'Circle',
}

export const OlDrawGeometryType = {
	POINT: OlGeometryType.POINT,
	LINE_STRING: OlGeometryType.LINE_STRING,
	POLYGON: OlGeometryType.POLYGON,
	CIRCLE: OlGeometryType.CIRCLE,
}

export const OlDrawStatus = {
	DRAW_START: 'drawstart',
	DRAW_END: 'drawend',
	DRAW_ABORT: 'drawabort',
}
