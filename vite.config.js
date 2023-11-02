import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { insertHtml, h } from 'vite-plugin-insert-html'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import compress from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(context => {
	const mode = context.mode
	const envDir = 'env'
	const isProd = mode === 'production'
	const env = loadEnv(mode, envDir)
	const olBaseUrl = env['VITE_OL_BASE_URL']
	const cesiumBaseUrl = env['VITE_CESIUM_BASE_URL']
	const olcsBaseUrl = env['VITE_OLCS_BASE_URL']
	const base = '/'

	const resolve = {
		alias: {
			'@': '/src',
		},
	}

	const plugins = [
		vue(),
		splitVendorChunkPlugin(),
		viteExternalsPlugin({
			cesium: 'Cesium',
		}),
		insertHtml({
			head: [
				h('script', {
					src: isProd ? `${cesiumBaseUrl}Cesium.js` : `${base}${cesiumBaseUrl}Cesium.js`,
				}),
				h('link', {
					rel: 'stylesheet',
					href: isProd ? `${cesiumBaseUrl}Widgets/widgets.css` : `${base}${cesiumBaseUrl}Widgets/widgets.css`,
				}),
				h('link', {
					rel: 'stylesheet',
					href: isProd ? `${olBaseUrl}ol.css` : `${base}${olBaseUrl}ol.css`,
				}),
				h('link', {
					rel: 'stylesheet',
					href: isProd ? `${olcsBaseUrl}olcs.css` : `${base}${olcsBaseUrl}olcs.css`,
				}),
			],
		}),
		AutoImport({
			resolvers: [ElementPlusResolver()],
		}),
		Components({
			resolvers: [ElementPlusResolver()],
		}),
	]
	if (!isProd) {
		const cesiumLibraryRoot = 'node_modules/cesium/Build/CesiumUnminified/'
		const cesiumLibraryCopyToRootPath = 'libs/Cesium/'
		const cesiumStaticSourceCopyOptions = ['Assets', 'ThirdParty', 'Workers', 'Widgets'].map(dirName => {
			return {
				src: `${cesiumLibraryRoot}${dirName}/*`,
				dest: `${cesiumLibraryCopyToRootPath}${dirName}`,
			}
		})
		plugins.push(
			viteStaticCopy({
				targets: [
					{
						src: `${cesiumLibraryRoot}Cesium.js`,
						dest: cesiumLibraryCopyToRootPath,
					},
					...cesiumStaticSourceCopyOptions,
				],
			})
		)
		const olcsLibraryRoot = 'node_modules/olcs'
		const olcsLibraryCopyToRootPath = 'libs/olcs2.16.0/'
		plugins.push(
			viteStaticCopy({
				targets: [
					{
						src: `${olcsLibraryRoot}/olcs.css`,
						dest: olcsLibraryCopyToRootPath,
					},
				],
			})
		)
	}
	// gzip压缩
	plugins.push(
		compress({
			threshold: 10 * 1024,
		})
	)

	return {
		base,
		envDir,
		mode,
		plugins,
		resolve,
	}
})
