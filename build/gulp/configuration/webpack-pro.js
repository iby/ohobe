/*globals module*/

'use strict';

var configuration = require('./webpack');
var webpack = require('webpack');

var DedupePlugin = webpack.optimize.DedupePlugin;

// Search for equal or similar files and deduplicate them in the output. This comes with some overhead for the
// entry chunk, but can reduce file size effectively.

configuration.plugins.push(new DedupePlugin());

module.exports = configuration;