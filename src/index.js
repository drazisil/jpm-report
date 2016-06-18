'use strict'

var fs = require('fs')
var VERSION = require('../package.json').version

function checkArgs (args, cb) {
  var argCount = args.length
  if (argCount < 4) {
    showHelp(cb)
  } else if (argCount === 3 || argCount === 4) {
    parseArg(args[2], cb)
  } else if (argCount > 4) {
    showHelp(cb)  }
}

function parseArg (arg, cb) {
  if (arg === '--version') {
    cb(VERSION)
  } else {
    // Check if a file
    fs.stat(arg, function cb_stat (err, stats) {
      if (err || !stats.isFile()) {
        cb('ERROR: ' + arg + ' is not a file.')
      } else {
        parseReport(arg, 'json', cb)
      }
    })
  }
}

function parseReport (path, format, cb) {
  // Check if a file
  fs.stat(arg, function cb_stat (err, stats) {
    if (err || !stats.isFile()) {
      cb('ERROR: ' + arg + ' is not a file.')
    }
  })
  fs.readFile(path, 'utf8', function cb_read_file (err, data) {
    if (err) {
      cb(err)
      return
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
        cb(null, res)
      } else {
        cb('ERROR: output format not supported, please see help')
      }
    } else {
      // No match, clearly an error
      cb('ERROR: unable to locate result line')
    }
  })
}

function outputJUnit (input) {
    res = JSON.parse(input)
    if (res.success.total_success === res.success.total_tests) {
      var strOutput = ''
      strOutput += '<testsuite errors="0" failures="0" name="" tests="' + res.success.total_tests + '" time="223">'
      strOutput += '<testcase classname="main"></testcase>'
      strOutput += '</testsuite>'
      process.stdout.write(strOutput)
      process.exit()
    } else {
      process.stdout.write(res.success.total_success + ' of ' + res.success.total_tests + ' passed')
      process.exit(1)
    }
}

function outputJUnit2File (input, filename) {
    res = JSON.parse(input)
    var strOutput = ''
    if (res.success.total_success === res.success.total_tests) {
      strOutput += '<testsuite errors="0" failures="0" name="" tests="' + res.success.total_tests + '" time="223">'
      strOutput += '<testcase classname="main"></testcase>'
      strOutput += '</testsuite>'
      fs.writeFileSync(strOutput, filename)
      process.stdout.write(strOutput)
      process.exit()
    } else {
      strOutput += res.success.total_success + ' of ' + res.success.total_tests + ' passed'
      fs.writeFileSync(strOutput, filename)
      process.stdout.write(strOutput)
      process.exit(1)
    }
}

function showHelp (cb) {
  strHelp = 'jpm-report <input file> (output file)'
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
