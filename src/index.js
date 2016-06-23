'use strict'

var fs = require('fs')
var VERSION = require('../package.json').version

function checkArgs (args, cb) {
  var argCount = args.length
  if (argCount < 3) {
    showHelp(cb)
  } else if (argCount === 3) {
    parseArg([args[2]], cb)
  } else if (argCount === 4) {
    parseArg([args[2], args[3]], cb)
  } else if (argCount > 4) {
    showHelp(cb)
  }
}

function parseArg (args, cb) {
  if (args[0] === '--version') {
    cb(VERSION)
  } else {
    // Check if a file
    try {
      fs.statSync(args[0])
      cb(null, args)
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (typeof args === Array) {
          cb('ERROR: ' + args[0] + ' is not a file.')
        } else {
          cb('ERROR: ' + args + ' is not a file.')
        }
      } else {
        cb(err)
      }
    }
  }
}

function parseReport (args, cb) {
  // Check if a file
  var path
  var data
  if (typeof args === Array) {
    path = args[0]
  } else {
    path = args
  }
  try {
    data = fs.readFileSync(path, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      cb('ERROR: ' + path + ' is not a file.')
      return
    } else {
      cb(err)
    }
  }
  // Look for a success line
  // var rePackageName = /^JPM \[info\] Starting jpm test on (.*)$/im
  var re = /^([\d]+) of ([\d]+) tests passed/im
  // var found1 = data.match(rePackageName)
  var found2 = data.match(re)
  // if (found1 && found2) {
  if (found2) {
    var res =
      {'success': {
        // 'contents': data,
        // 'package_name': found1[1],
        'package_name': 'jpm',
        'total_tests': found2[2],
        'total_success': found2[1]}
      }
    cb(null, res)
  } else {
    // No match, clearly an error
    cb('ERROR: unable to locate result line')
  }
}

function outputJUnit (input, cb) {
  var output = createJUnitXml(input)
  cb(null, output)
}

function outputJUnit2File (input, filename, cb) {
  var output = createJUnitXml(input)
  fs.writeFileSync(filename, output)
  cb(null, 0)
}

function showHelp (cb) {
  var strHelp = 'jpm-report <input file> (output file)'
  cb(strHelp)
}

function createJUnitXml (input) {
  var total_failures = input.success.total_tests - input.success.total_success
  var total_tests = input.success.total_tests
  var output = ''
  output += '<testsuite errors="0" failures="' + total_failures + '"' +
    ' name="' + input.success.package_name + '"' +
    ' timestamp="' + toISOStringJUnit(new Date()) + '"' +
    ' tests="' + total_tests + '"' +
    ' hostname="localhost"' +
    ' time="223">\n'
  output += '  <properties>\n<property name="generator" value="jpm-report" />\n</properties>\n'
  var testcase = '  <testcase classname="main"' +
  ' name="' + input.success.package_name + '"' +
  ' time="223"></testcase>\n'
  var system_out = '<system-out />\n'
  var system_err = '<system-err />\n'
  for (var i = 0; i < total_tests; i++) {
    output += testcase
  }
  output += system_out
  output += system_err
  output += '</testsuite>'
  return output
}

function toISOStringJUnit (d) {
  return d.getFullYear() + '-' + (' 0' + d.getMonth()).slice(-2) + '-' +
    ('0' + d.getDay()).slice(-2) + 'T' +
    ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' +
    ('0' + d.getSeconds()).slice(-2)
}

module.exports = {
  checkArgs: checkArgs,
  parseArg: parseArg,
  parseReport: parseReport,
  showHelp: showHelp,
  outputJUnit: outputJUnit,
  outputJUnit2File: outputJUnit2File
}
