/**
 * Webpack building configuration.
 *
 * {@link http://webpack.github.io/docs/configuration.html}
 * {@link http://github.com/webpack/example-app/blob/master/webpack.config.js}
 */

import {configuration as pathConfiguration} from './Path';

import glob = require('glob');
import path = require('path');

export var configuration = {
    cache: true,
    context: pathConfiguration.source,
    entry: glob.sync(path.join(pathConfiguration.source, '*.js')).reduce(function (object, value) {
        object[path.basename(value, path.extname(value))] = value;
        return object;
    }, {}),

    plugins: [],

    resolveLoader: {
        root: path.join(pathConfiguration.root, 'node_modules')
    },

    resolve: {
        modulesDirectories: ['.', 'web_modules', 'node_modules']
    },

    output: {
        path: path.join(pathConfiguration.product),
        pathinfo: true,
        filename: '[name].jsx'
    }
};