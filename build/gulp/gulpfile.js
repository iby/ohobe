/*globals module*/

'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

// Tasks are broken into separate modules.

require('./gulp-build.js')();

// Default task.

gulp.task('default', function (callback) {
    return runSequence(
        'build',
        callback);
});