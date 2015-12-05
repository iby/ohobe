/*globals module*/

'use strict';

var configuration = require('./configuration/gulp');
var guild = require('@ianbytchek/guild');
var gulp = require('gulp');
var replace = require('gulp-replace');
var webpackConfiguration = require('./configuration/webpack');

guild(gulp, {
    build: {
        webpack: {
            source: configuration.path.source,
            destination: configuration.path.product,
            configuration: webpackConfiguration,
            plugins: [guild.Plugin.DEFAULT, replace(/@see/g, '')]
        }
    }
});