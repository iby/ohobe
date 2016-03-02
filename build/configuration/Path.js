'use strict';

var path = require('path');
var PathConfiguration = require('@ianbytchek/guild').PathConfiguration;

module.exports = new PathConfiguration(path.join(__dirname, '../..'));