'use strict'

var fs = require('fs')
var VERSION = require('../package.json').version

function checkArgs (args, cb) {
  var argCount = args.length
  if (argCount < 3) {
    showHelp(cb)
  } else if (argCount === 3) {
    parseArg(args[2], cb)
  } else if (argCount > 3) {
    cb('ERROR: too many arguments, please use --help')
  }
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
        parseReport(arg, cb)
      }
    })
  }
}

function parseReport (path, cb) {
  fs.readFile(path, 'utf8', function cb_read_file (err, data) {
    if (err) {
      cb(err)
      return
    }
    // Look for a success line
    var re = /^([\d]+) of ([\d]+) tests passed/im
    var found = data.match(re)
    if (found) {
      var res = JSON.stringify(
        {'success': {
          'contents': data,
          'total_tests': found[2],
          'total_success': found[1]}
        }
      )
      cb(null, res)
    } else {
      // No match, clearly an error
      cb('ERROR: unable to locate result line')
    }
  })
}

function showHelp (cb) {
  cb('Please use --version')
}

module.exports.checkArgs = checkArgs
module.exports.parseArg = parseArg
module.exports.parseReport = parseReport
module.exports.showHelp = showHelp
