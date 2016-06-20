'use strict'

/* global describe it */
var assert = require('assert')
var fs = require('fs')
var jpm_report = require('../src/index.js')
var VERSION = require('../package.json').version

describe('Checking args', function () {
  it('with no args', function cb_parse_args_zero (done) {
    jpm_report.checkArgs(['node', 'jpm_report'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, 'jpm-report <input file> (output file)')
        done()
      }
    })
  })

  it('with one arg - version', function cb_parse_args_version (done) {
    jpm_report.checkArgs(['node', 'jpm_report', '--version'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, VERSION)
        done()
      }
    })
  })

  it('with one arg - not a file', function cb_parse_args_one_not (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'moo'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, 'ERROR: moo is not a file.')
        done()
      }
    })
  })

  it('with one arg - a file', function cb_parse_args_one (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'test-data/success.txt'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        assert.equal(res[0], 'test-data/success.txt')
        done()
      }
    })
  })

  it('with two args', function cb_parse_args_two (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'test-data/success.txt', 'test-data/success.xml'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        assert.equal(res[0], 'test-data/success.txt')
        assert.equal(res[1], 'test-data/success.xml')
        done()
      }
    })
  })

  it('with more then two args', function cb_parse_args_two (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'test-data/success.txt', 'test-data/success.xml', 'moo'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(err, 'jpm-report <input file> (output file)')
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })
})

describe('testing report processing', function () {
  it('invalid file', function (done) {
    jpm_report.parseReport('test-data/FHFFY^fdhwhd', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'ERROR: test-data/FHFFY^fdhwhd is not a file.')
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test error', function (done) {
    jpm_report.parseReport('test-data/error.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'ERROR: unable to locate result line')
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test no error, hangs', function (done) {
    jpm_report.parseReport('test-data/error-no-error.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'ERROR: unable to locate result line')
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test failure', function (done) {
    jpm_report.parseReport('test-data/failure.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        assert.notEqual(res, 'moo')
        done()
      }
    })
  })

  it('test success', function (done) {
    jpm_report.parseReport('test-data/success.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        assert.equal(res.success.total_success, 15)
        done()
      }
    })
  })

  it('test success with errors after', function (done) {
    jpm_report.parseReport('test-data/success-error.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        assert.equal(res.success.total_success, 15)
        done()
      }
    })
  })
})

describe('testing junit output: success', function () {
  it('test success', function (done) {
    jpm_report.parseReport('test-data/success.txt', function cbParseReport (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        fs.writeFileSync('test-data/success.json', JSON.stringify(res))
        var inJSON = JSON.parse(fs.readFileSync('test-data/success.json'))
        jpm_report.outputJUnit2File(inJSON, 'test-data/success.xml', function cbOutputJUnitFile (exitCode) {
          assert.ok('success')
          done()
        })
      }
    })
  })

  it('test fail', function (done) {
    jpm_report.parseReport('test-data/failure.txt', function cb_parse_report (err, res) {
      if (err) {
        assert.equal(err, 'should not have an error')
        done()
      } else {
        fs.writeFileSync('test-data/failure.json', JSON.stringify(res))
        var inJSON = JSON.parse(fs.readFileSync('test-data/failure.json'))
        jpm_report.outputJUnit2File(inJSON, 'test-data/failure.xml', function cbOutputJUnitFile (exitCode) {
          assert.ok('success')
          done()
        })
      }
    })
  })
})
