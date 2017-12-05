const path = require('path'),
webpack = require('webpack'),
ExtractTextPlugin = require('extract-text-webpack-plugin'),
// CopyWebpackPlugin = require('copy-webpack-plugin'),
UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
crypto = require('crypto'),
AssetsPlugin = require('assets-webpack-plugin'),
packageData = require('./package.json'),
envVars = process.env || {},
environment = envVars.ENVIRONMENT || 'prod',
config = require('./cfg/index.js'),
appEnv = envVars.APP_ENVIRONMENT || 'prod',
debugMode = envVars.DEBUG || 'false',
appConfig = config(appEnv, 'app'),
distDir = path.join(__dirname,  './dist/'),
staticDir = distDir + 'static/',
devMode = envVars.DEV_MODE || '',
nodeEnv = envVars.NODE_ENV || 'production';

function checksum (str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

let cssRuleLoaders = [
    {
        loader: 'css-loader',
        options: {
            sourceMap: true,
            minimize: (nodeEnv === 'production'),
            module: true,
            importLoaders: 1,
            localIdentName: (environment === 'local') ? '[name]__[local]--[hash:8]' : '[hash:8]'
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            config: {
                path: 'postcss.config.js'
            }
        }
    }
],
babelLoaderPlugins = [
    'transform-object-rest-spread',
    'syntax-dynamic-import',
    'transform-class-properties',
    'async-to-promises'
],
webpackConfig = {
    entry: {
        /*
        vendor_js: [
            // 'es6-promise/auto',
            'react',
            'react-dom',
            'react-router-dom',
            'react-helmet',
            'react-redux',
            'redux'
            // 'axios'
        ],
        */
        app: [
            './src/client/index.js'
        ]
    },

    output: {
        filename: 'assets/[name].[chunkhash:20].js',
        path: staticDir,
        // publicPath: '//' + appConfig.content.cdn.assets + '/',
        chunkFilename: 'assets/[name].[chunkhash:20].js'
    },

    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src/'),
            importClientOnlySrc: path.resolve(__dirname, 'src')
        }
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js|jsx)$/,
                exclude: /node_modules|\.min\.js/,
                loader: 'eslint-loader'
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: ExtractTextPlugin.extract({fallback: 'style-loader', use: cssRuleLoaders})
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules|\.min\.js/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: [
                                        'last 2 versions',
                                        '> 5%'
                                    ]
                                }
                            }],
                            'react'
                        ],
                        plugins: babelLoaderPlugins
                    }
                }]
            }
        ]
    },

    plugins: [
        /*
        new webpack.ProvidePlugin({
            axios: 'axios'
        }),
        */

        new webpack.DefinePlugin({
            __CLIENT__: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
            __APP_CONFIG__: JSON.stringify(appConfig)
            // __DEBUG__: JSON.stringify(appConfig.enable.debug)
        }),

        /*
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor_js', 'manifest'],
            filename: 'assets/[name].[hash:20].js',
            minChunks: Infinity
        }),
        */

        new webpack.optimize.CommonsChunkPlugin({
            name: 'app',
            filename: 'assets/[name].[chunkhash:20].js',
            minChunks: 3,
            children: true
        }),

        new webpack.optimize.ModuleConcatenationPlugin(),

        new AssetsPlugin({
            path: staticDir + 'assets/', 
            filename: 'bundles.json',
            processOutput: function (assets) {
                assets.metadata.checksum = checksum(JSON.stringify(assets));

                return JSON.stringify(assets);
            },
            metadata: {
                env: appEnv
            }
        }),

        new ExtractTextPlugin({
            ignoreOrder: true,
            filename: 'assets/[name].[contenthash:20].css',
            allChunks: true
        })
    ],

    devtool: (debugMode === 'true') ? 'eval-source-map' : 'none'
};

// add in node env specific configuration
if (nodeEnv === 'production') {
    webpackConfig.plugins.push(
        new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        })
    );
}

module.exports = webpackConfig;
