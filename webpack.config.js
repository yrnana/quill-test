const path = require('path')
const url = require('url')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const servedPath = () => {
	const publicUrl = require(path.resolve(__dirname, 'package.json')).homepage
	const servedUrl = publicUrl ? url.parse(publicUrl).pathname : '/'
	return !servedUrl.endsWith('/') ? `${servedUrl}/` : servedUrl
}

module.exports = function(env) {
	const isProd = env === 'production'
	const publicPath = isProd ? servedPath() : '/'

	return {
		mode: isProd ? 'production' : 'development',
		entry: path.resolve(__dirname, 'src', 'index.js'),
		output: {
			path: isProd ? path.resolve(__dirname, 'build') : undefined,
			filename: isProd
				? 'static/js/[name].[contenthash:8].js'
				: 'static/js/bundle.js',
			chunkFilename: isProd
				? 'static/js/[name].[contenthash:8].chunk.js'
				: 'static/js/[name].chunk.js',
			publicPath: publicPath,
		},
		module: {
			rules: [
				{
					oneOf: [
						{
							test: /\.(js)$/,
							use: {
								loader: 'babel-loader',
								options: {
									presets: ['@babel/preset-env'],
									cacheDirectory: true,
								},
							},
						},
						{
							test: /\.ts$/,
							use: {
								loader: 'ts-loader',
								options: {
									compilerOptions: {
										declaration: false,
										target: 'es5',
										module: 'commonjs',
									},
									transpileOnly: true,
								},
							},
						},
						{
							test: /\.svg$/,
							use: {
								loader: 'html-loader',
								options: {
									minimize: true,
								},
							},
						},
						{
							test: /\.css$/,
							use: [
								isProd && {
									loader: MiniCssExtractPlugin.loader,
									options:
										publicPath === './'
											? { publicPath: '../../' }
											: {},
								},
								!isProd && 'style-loader',
								'css-loader',
							].filter(Boolean),
						},
						{
							test: /\.(scss|sass)$/,
							use: [
								isProd && {
									loader: MiniCssExtractPlugin.loader,
									options:
										publicPath === './'
											? { publicPath: '../../' }
											: {},
								},
								!isProd && 'style-loader',
								'css-loader',
								'sass-loader',
							].filter(Boolean),
						},
						{
							loader: require.resolve('file-loader'),
							exclude: [/\.(js|jsx)$/, /\.html$/, /\.json$/],
							options: {
								name: 'static/media/[name].[hash:8].[ext]',
							},
						},
					],
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin(
				Object.assign(
					{},
					{
						inject: true,
						template: path.resolve(__dirname, 'src', 'index.html'),
					},
					isProd
						? {
								minify: {
									removeComments: true,
									collapseWhitespace: true,
									removeRedundantAttributes: true,
									useShortDoctype: true,
									removeEmptyAttributes: true,
									removeStyleLinkTypeAttributes: true,
									keepClosingSlash: true,
									minifyJS: true,
									minifyCSS: true,
									minifyURLs: true,
								},
						  }
						: undefined
				)
			),
			isProd &&
				new MiniCssExtractPlugin({
					filename: 'static/css/[name].[contenthash:8].css',
					chunkFilename:
						'static/css/[name].[contenthash:8].chunk.css',
				}),
		].filter(Boolean),
		resolve: {
			alias: {
				parchment: path.resolve(
					__dirname,
					'node_modules/parchment/src/parchment.ts'
				),
				quill$: path.resolve(__dirname, 'node_modules/quill/quill.js'),
			},
			extensions: ['.js', '.ts', '.svg'],
		},
	}
}
