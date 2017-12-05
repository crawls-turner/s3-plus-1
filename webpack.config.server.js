const nodeExternals = require('webpack-node-externals'),
path = require('path'),
ExtractTextPlugin = require('extract-text-webpack-plugin'),
webpack = require('webpack'),
packageData = require('./package.json'),
envVars = process.env || {},
environment = envVars.ENVIRONMENT || 'prod',
appEnv = envVars.APP_ENVIRONMENT || 'prod',
debugMode = envVars.DEBUG || 'false',
config = require('./cfg/index.js'),
appConfig = config(appEnv, 'app'),
serverConfig = config(appEnv, 'server'),
srcPath = path.resolve(__dirname),
distPath = path.resolve(__dirname, './dist/server/'),
nodeEnv = envVars.NODE_ENV || 'production';

module.exports = {
context: srcPath,

entry: './src/server/index.js',

output: {
    path: distPath,
    filename: 'server.js'
},

target: 'node',

node: {
    __dirname: false,
    __filename: false
},

resolve: {
    alias: {
        src: path.resolve(__dirname, 'src/')
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
            test: /\.(js|jsx)$/,
            exclude: [/node_modules/],
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        'react'
                    ],
                    plugins: [
                        'transform-object-rest-spread',
                        'syntax-dynamic-import',
                        'transform-class-properties'
                    ]
                }
            }]
        }
        // loaders for other file types can go here
    ]
},

externals: [
    nodeExternals({
        whitelist: []
    }),

    function (context, request, callback) {
        if (/webpack\.config|bundles\.json/.test(request)) {
            return callback(null, 'commonjs ' + request);
        }
        callback();
    }
],

plugins: [
    new webpack.IgnorePlugin(/^importClientOnlySrc\/.*/),

    new webpack.NormalModuleReplacementPlugin(
        /^src\/client\/routes\.js$/,
        'src/server/routes.js'
    ),

    new webpack.DefinePlugin({
        __CLIENT__: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        __APP_CONFIG__: JSON.stringify(appConfig)
        // __DEBUG__: JSON.stringify(appConfig.enable.debug)
    })
],

devtool: (debugMode === 'true') ? 'eval-source-map' : 'none'
};