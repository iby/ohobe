/**
 * Webpack building configuration.
 *
 * {@link http://webpack.github.io/docs/configuration.html}
 * {@link http://github.com/webpack/example-app/blob/master/webpack.config.js}
 */

'use strict';

var gulpConfiguration = require('./Path');
var path = require('path');
var glob = require('glob');

var context = path.join(gulpConfiguration.source);

// Setup the main config.

var webpackConfiguration = {
    cache: true,
    context: context,
    entry: glob.sync(path.join(context, '*.js')).reduce(function (object, value) {
        object[path.basename(value, path.extname(value))] = value;
        return object;
    }, {}),

    plugins: [],

    resolveLoader: {
        root: path.join(gulpConfiguration.root, 'node_modules')
    },

    resolve: {
        modulesDirectories: ['.', 'web_modules', 'node_modules']
    },

    output: {
        path: path.join(gulpConfiguration.product),
        pathinfo: true,
        filename: '[name].jsx'
    }
};

module.exports = webpackConfiguration;