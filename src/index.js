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
      if (typeof args === Array) {
        var stats = fs.statSync(args[0])
      } else {
        var stats = fs.statSync(args)
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        if (typeof args === Array) {
          cb('ERROR: ' + args[0] + ' is not a file.')
        } else {
          cb('ERROR: ' + args + ' is not a file.')
        }
      }
      cb(err)
    }
    parseReport(args, cb)
  }
}

function parseReport (args, cb) {
  // Check if a file
  if (typeof args === Array) {
    var path = args[0]
  } else {
    var path = args
  }
  try {
    fs.statSync(path)
  } catch (err) {
    if (err.code === 'ENOENT') {
      cb('ERROR: ' + path + ' is not a file.')
    }
    cb(err)
  }
  try {
    var data = fs.readFileSync(path, 'utf8')
  } catch (err) {
    cb(err)
  }
  // Look for a success line
  var re = /^([\d]+) of ([\d]+) tests passed/im
  var found = data.match(re)
  if (found) {
    var res = JSON.stringify(
      {'success': {
        // 'contents': data,
        'total_tests': found[2],
        'total_success': found[1]}
      }
    )
    if (args.length === 2) {
      outputJUnit2File (res, args[1], function (exitCode){
        cb(null, exitCode)
      })
    } else {
      outputJUnit (res, function (err, res) {
        if (err) {
          cb(err)
        }
        cb(null, res)
      })
    }
  } else {
    // No match, clearly an error
    cb('ERROR: unable to locate result line')
  }
}

function outputJUnit (input, cb) {
  var res = JSON.parse(input)
  var total_failures = res.success.total_tests = res.success.total_success
  var strOutput = ''
  strOutput += '<testsuite errors="0" failures="' + total_failures + '" name="" tests="' + res.success.total_tests + '" time="223">'
  strOutput += '<testcase classname="main"></testcase>'
  strOutput += '</testsuite>'
  cb(null, strOutput)
}

function outputJUnit2File (input, filename, cb) {
  var res = JSON.parse(input)
  var total_failures = res.success.total_tests = res.success.total_success
  var strOutput = ''
  if (res.success.total_success === res.success.total_tests) {
    strOutput += '<testsuite errors="0" failures="' + total_failures + '" name="" tests="' + res.success.total_tests + '" time="223">'
    strOutput += '<testcase classname="main"></testcase>'
    strOutput += '</testsuite>'
    fs.writeFileSync(filename, strOutput)
    // process.stdout.write(strOutput)
    cb(null, 0)
  } else {
    strOutput += res.success.total_success + ' of ' + res.success.total_tests + ' passed'
    fs.writeFileSync(filename, strOutput)
    cb(null, 1)
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
