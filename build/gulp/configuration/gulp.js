'use strict';

var path = require('path');

module.exports = {
    path: {
        dependency: path.join(__dirname, '../../../dependency'),
        product: path.join(__dirname, '../../../product'),
        root: path.join(__dirname, '../../..'),
        source: path.join(__dirname, '../../../source')
    }
};