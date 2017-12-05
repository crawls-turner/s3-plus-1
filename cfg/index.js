'use strict';

const config = {
    app: require('./json/app.json'),
    server: require('./json/server.json')
};

function mergeConfig(obj, source) {
    let prop;

    for (prop in source) {
        if (typeof obj[prop] === 'undefined') {
            obj[prop] = source[prop];
        } else if (typeof obj[prop] === 'object' && !Array.isArray(obj[prop]) && !Array.isArray(source[prop])) {
            obj[prop] = mergeConfig(obj[prop], source[prop]);
        }
    }

    return obj;
}

module.exports = function (environment, type) {
    switch(type) {
        case 'app':
        case 'server': {
            return mergeConfig(config[type][environment], config[type].default);
        }
    }

    return {};
};
