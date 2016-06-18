'use strict'

var gulp = require('gulp')
var standard = require('gulp-standard')
var mocha = require('gulp-mocha')
var istanbul = require('gulp-istanbul')
var coveralls = require('gulp-coveralls')
var xsd = require('libxml-xsd')

gulp.task('standard', function () {
  return gulp.src(['./bin/jpm-report'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

gulp.task('pre-test', function () {
  return gulp.src(['src/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire())
})

gulp.task('test', ['pre-test'], function (cb) {
  return gulp.src([
    './test/**/*.js'
  ])
  .pipe(mocha({ reporter: 'spec' }))
  .pipe(istanbul.writeReports()) // stores reports in "coverage" directory
})

gulp.task('coveralls', function (cb) {
  return gulp.src('./coverage/lcov.info')
  .pipe(coveralls())
})

gulp.task('validateXML', ['test'], function (cb) {
  xsd.parseFile('./test-data/JUnit.xsd', function(err, schema){
    schema.validateFile('./test-data/success.xml', function(err, validationErrors){
      // err contains any technical error 
      if (err) {
        throw err
      }
      // validationError is an array, null if the validation is ok 
      if (validationErrors) {
        console.dir(validationErrors)
        exit(1)
      }
    }); 
  })
})

gulp.task('dev', ['standard', 'test', 'coveralls', 'validateXML'])

gulp.task('default', ['main'])
