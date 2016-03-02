'use strict';

var configuration = require('./configuration/Path');
var guild = require('@ianbytchek/guild').guild;
var gulp = require('gulp');
var replace = require('gulp-replace');

guild(gulp, {
    build: {
        webpack: {

            // Use full source path because we don't use language specific folders, like js / css.

            source: configuration.source,
            destination: configuration.product,
            configuration: require('./configuration/webpack'),
            plugins: function () {return [require('@ianbytchek/guild').Plugin.DEFAULT, replace(/@see/g, '')]}
        }
    },
    path: configuration
});