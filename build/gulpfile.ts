/// <reference path="../dependency/typings/reference.d.ts"/>

import {configuration as pathConfiguration} from './Configuration/Path';
import {configuration as webpackConfiguration} from './Configuration/Webpack';
import {guild, Plugin} from '@ianbytchek/guild';

import gulp = require('gulp');
import replace = require('gulp-replace');

guild(gulp, {
    build: {
        webpack: {

            // Use full source path because we don't use language specific folders, like js / css.

            source: pathConfiguration.source,
            destination: pathConfiguration.product,
            configuration: webpackConfiguration,
            plugins: function () {return [Plugin.DEFAULT, replace(/@see/g, '')]}
        }
    },
    path: pathConfiguration
});