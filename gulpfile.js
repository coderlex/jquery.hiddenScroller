'use strict'

const gulp            = require('gulp'),
      rename          = require('gulp-rename'),
      gutil           = require('gulp-util'),
      cleanDest       = require('gulp-clean-dest'),
      sourcemaps      = require('gulp-sourcemaps'),
      path            = require('path'),
      uglify          = require('gulp-uglify'),
      pump            = require('pump'),
      connect         = require('gulp-connect'),
      eslint          = require('gulp-eslint'),
      notify          = require('gulp-notify'),
      open            = require('gulp-open')

const DEBUG = ['prod', 'production'].indexOf(process.env.NODE_ENV) < 0

let TASK_NOTIFICATION = false,
    LIVE_RELOAD = false

function jsTask(minify) {
	return cb => {
		pump([
			gulp.src('src/main.js'),
			cleanDest('dist/js'),
			DEBUG ? eslint('eslint.json') : gutil.noop(),
			DEBUG ? eslint.format() : gutil.noop(),
			DEBUG ? eslint.failAfterError() : gutil.noop(),
			minify ? sourcemaps.init() : gutil.noop(),
			minify ? uglify() : gutil.noop(),
			rename('jquery.hiddenScroller' + (minify ? '.min.js' : '.js')),
			minify ? sourcemaps.write('./maps') : gutil.noop(),
			gulp.dest('dist/js'),
			LIVE_RELOAD ? connect.reload() : gutil.noop(),
			TASK_NOTIFICATION ? notify({ message: 'JS built.', onLast: true }) : gutil.noop()
		], cb);
	}
}

gulp.task('js', jsTask(false))
gulp.task('js:min', jsTask(true))

gulp.task('watch', function() {
	LIVE_RELOAD = true
	TASK_NOTIFICATION = true
	connect.server({
		name: 'Dist App',
		root: 'dist',
		port: 8080,
		livereload: true
	});
	gulp.watch('src/**/*', ['js', 'js:min'])
	gulp.src(__filename).pipe(open({uri: 'http://localhost:8080'}))
});

gulp.task('build', ['js', 'js:min'])

gulp.task('default', ['watch'])