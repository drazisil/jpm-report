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
    fs.stat(args[0], function cb_stat (err, stats) {
      if (err || !stats.isFile()) {
        cb('ERROR: ' + args[0] + ' is not a file.')
      } else {
        parseReport(args, 'json', cb)
      }
    })
  }
}

function parseReport (args, format, cb) {
  // Check if a file
  var path = args[0]
  fs.stat(path, function cb_stat (err, stats) {
    if (err || !stats.isFile()) {
      cb('ERROR: ' + path + ' is not a file.')
    }
  })
  fs.readFile(path, 'utf8', function cb_read_file (err, data) {
    if (err) {
      cb(err)
    }
    // Look for a success line
    var re = /^([\d]+) of ([\d]+) tests passed/im
    var found = data.match(re)
    if (found) {
      if (format === 'json') {
        var res = JSON.stringify(
          {'success': {
            'contents': data,
            'total_tests': found[2],
            'total_success': found[1]}
          }
        )
        if (args.length === 2) {
          outputJUnit2File (res, args[1], function (exitCode){
            cb(exitCode)
          })
        } else {
          outputJUnit (res, function (exitCode){
            cb(exitCode)
          })
        }
      } else {
        cb('ERROR: output format not supported, please see help')
      }
    } else {
      // No match, clearly an error
      cb('ERROR: unable to locate result line')
    }
  })
}

function outputJUnit (input, cb) {
  var res = JSON.parse(input)
  var total_failures = res.success.total_tests = res.success.total_success
  var strOutput = ''
  strOutput += '<testsuite errors="0" failures="' + total_failures + '" name="" tests="' + res.success.total_tests + '" time="223">'
  strOutput += '<testcase classname="main"></testcase>'
  strOutput += '</testsuite>'
  process.stdout.write(strOutput)
  cb(0)
}

function outputJUnit2File (input, filename, cb) {
  var total_failures = res.success.total_tests = res.success.total_success
  var strOutput = ''
  var res = JSON.parse(input)
  if (res.success.total_success === res.success.total_tests) {
    strOutput += '<testsuite errors="0" failures="' + total_failures + '" name="" tests="' + res.success.total_tests + '" time="223">'
    strOutput += '<testcase classname="main"></testcase>'
    strOutput += '</testsuite>'
    fs.writeFileSync(filename, strOutput)
    // process.stdout.write(strOutput)
    cb(0)
  } else {
    strOutput += res.success.total_success + ' of ' + res.success.total_tests + ' passed'
    fs.writeFileSync(filename, strOutput)
    // process.stdout.write(strOutput)
    cb(1)
  }
}

function showHelp (cb) {
  var strHelp = 'jpm-report <input file> (output file)'
  cb(strHelp)
}

module.exports = {
  checkArgs: checkArgs,
  parseArg: parseArg,
  parseReport: parseReport,
  showHelp: showHelp,
  outputJUnit: outputJUnit,
  outputJUnit2File: outputJUnit2File
}
