/**
 * Webpack building configuration.
 *
 * {@link http://webpack.github.io/docs/configuration.html}
 * {@link http://github.com/webpack/example-app/blob/master/webpack.config.js}
 */

'use strict';

var gulpConfiguration = require('./gulp');
var path = require('path');
var webpack = require('webpack');
var glob = require("glob");

var context = path.join(gulpConfiguration.path.source);

// Setup the main config.

var webpackConfiguration = {
    cache: true,
    context: context,
    entry: glob.sync(path.join(context, '*.jsx')).reduce(function (object, value) {
        object[path.basename(value, path.extname(value))] = value;
        return object;
    }, {}),

    plugins: [],

    resolveLoader: {
        root: path.join(gulpConfiguration.path.root, 'node_modules')
    },

    resolve: {
        modulesDirectories: ['.', 'web_modules', 'node_modules']
    },

    output: {
        path: path.join(gulpConfiguration.path.product),
        pathinfo: true,
        filename: '[name].jsx'
    }
};

module.exports = webpackConfiguration;