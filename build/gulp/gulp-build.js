/**
 * Builds Webpack bundle, visit {@link http://webpack.github.io/docs/usage-with-gulp.html} for details and examples.
 */

'use strict';

var chalk = require('chalk');
var configuration = require('./configuration/gulp');
var del = require('del');
var gulp = require('gulp');
var minimist = require('minimist');
var moment = require('moment');
var path = require('path');
var sequence = require('run-sequence');
var util = require('gulp-util');
var Webpack = require('webpack');

var watch = util.env.w || util.env.watch;

module.exports = function () {

    // Parse cli options. First three are command, gulp and task, we don't want either of them.

    var parameters = minimist(process.argv.slice(3));
    var production = parameters['production'];

    // Clean dirs where we're going to build.

    gulp.task('build-clean-webpack', function (callback) {
        return del(path.join(configuration.path.product, '*'), {force: true}, callback);
    });

    // Webpack task.

    gulp.task('build-webpack', function (callback) {
        var webpackConfiguration = require('./configuration/webpack-' + (production ? 'pro' : 'dev') + '.js');

        webpackConfiguration.watch = watch;
        webpackConfiguration.output.path = path.join(configuration.path.product);

        return new Webpack(webpackConfiguration, function (error, stats) {
            if (error) {
                throw new util.PluginError('webpack', error);
            }

            util.log(chalk.yellow.bold('[webpack] ' + moment().format('DD MMM YYYY, hh:mm:ss a')) + '\n\n' + stats.toString({colors: true}) + '\n');

            callback();
        });
    });

    gulp.task('build', function (callback) {
        var cleanTasks = [];
        var buildTasks = [];

        // If no arguments were specified, normally that's how it would be, we want to build everything.

        cleanTasks.push('build-clean-webpack');
        buildTasks.push(['build-webpack']);

        return sequence.apply(null, [cleanTasks].concat(buildTasks, [callback]));
    });
};