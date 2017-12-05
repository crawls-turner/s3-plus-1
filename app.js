if (process.env.DEV_MODE === 'ssr') {
    // Enable development w/ server side rendering
    const webpack = require('webpack');
    const nodemon = require('nodemon');
    const clientConfig = require('./webpack.config.js');
    const serverConfig = require('./webpack.config.server.js');
    const webpackClient = webpack(clientConfig);
    const webpackServer = webpack(serverConfig);

    let isNodeMonitored = false,
        nm;

    const startNodeMon = () => {
        console.log('[nodemon] Starting...');

        nm = nodemon({
            script: './dist/server/server.js',
            ignore: [],
            watch: false,
            verbose: true
        }).on('start', function() {
            console.log('[nodemon] App running.');
        }).on('restart', function () {
            console.log('[nodemon] App restarted.');
        }).on('crash', function() {
            console.log('[nodemon] Crashed!');
        });
    };

    console.log('[develop:ssr] Starting up webpack and nodemon...');

    const clientWatch = webpackClient.watch({}, function (err, stats) {
        if (err) {
            console.log('[webpack:client]');
            console.log(err);
        }

        let logString = stats.toString('errors-only');
        
        if (logString.length > 0) {
            console.log('[webpack:client]');
            console.log(logString);
        } else {
            console.log('[webpack:client] Compilation successful.');

            /**
             * @todo Can we use non webpack require to get dist/assets.json on request to eliminate the need for restart?
             */
            if (typeof nm === 'function') {
                nm.emit('restart');
            }
        }
    });

    const serverWatch = webpackServer.watch({
        aggregateTimeout: 1000
    }, function (err, stats) {
        if (err) {
            console.log('[webpack:server]');
            console.log(err);
        }

        let logString = stats.toString('errors-only');

        if (logString.length > 0) {
            console.log('[webpack:server]');
            console.log(logString);
        } else {
            console.log('[webpack:server] Compilation successful.');

            if (typeof nm === 'function') {
                nm.emit('restart');
            }
        }
        
        if (!isNodeMonitored) {
            startNodeMon();
            isNodeMonitored = true;
        }
    });

    process.on('SIGINT', function() {
        console.log('SIGINT');
        console.log('[node] Cleaning up before interrupt signal...');
        clientWatch.close(function() {
            console.log('[webpack:client] Stopped.');
            serverWatch.close(function() {
                console.log('[webpack:server] Stopped.');
                nodemon.on('exit', function() {
                    console.log('[nodemon] Stopped.');
                    console.log('[node] Now you can exit cleanly...');
                    process.exit();
                }).emit('quit');
            });
        });
    });    
} else {
    // Go Go Production!
    require('./dist/server/server.js');
}