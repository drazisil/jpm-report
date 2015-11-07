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
  cb(null, "I'm a file")
}

function showHelp (cb) {
  cb('Please use --version')
}

module.exports.checkArgs = checkArgs
module.exports.parseArg = parseArg
module.exports.parseReport = parseReport
module.exports.showHelp = showHelp
