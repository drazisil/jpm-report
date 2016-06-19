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
        assert.equal('jpm-report <input file> (output file)', err)
        done()
      }
    })
  })

  it('with one arg - version', function cb_parse_args_version (done) {
    jpm_report.checkArgs(['node', 'jpm_report', '--version'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal(VERSION, err)
        done()
      }
    })
  })

  it('with one arg - not a file', function cb_parse_args_one_not (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'moo'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('ERROR: moo is not a file.', err)
        done()
      }
    })
  })

  it('with one arg - a file', function cb_parse_args_one (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'test-data/success.txt'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        res = JSON.parse(res)
        assert.equal(res.success.total_success, res.success.total_tests)
        done()
      }
    })
  })

  it('with two args', function cb_parse_args_two (done) {
    jpm_report.checkArgs(['node', 'jpm_report', test-data/success.txt', 'test-data/success.xml'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('jpm-report <input file> (output file)', err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('with more then one arg', function cb_parse_args_two (done) {
    jpm_report.checkArgs(['node', 'jpm_report', test-data/success.txt', 'test-data/success.xml', 'moo'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('jpm-report <input file> (output file)', err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

})

describe('testing report processing, output: foo', function () {
  it('test success', function (done) {
    jpm_report.parseReport('test-data/success.txt', 'foo', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('ERROR: output format not supported, please see help', err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })
})

describe('testing report processing, output: json', function () {
  it('invalid file', function (done) {
    jpm_report.parseReport('test-data/FHFFY^fdhwhd', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal("Error: ENOENT, open 'test-data/FHFFY^fdhwhd'", err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test error', function (done) {
    jpm_report.parseReport('test-data/error.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('ERROR: unable to locate result line', err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test no error, hangs', function (done) {
    jpm_report.parseReport('test-data/error-no-error.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('ERROR: unable to locate result line', err)
        done()
      } else {
        assert.fail('should have an error')
        done()
      }
    })
  })

  it('test failure', function (done) {
    jpm_report.parseReport('test-data/failure.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        res = JSON.parse(res)
        assert.notEqual(res.success.total_success, res.success.total_tests)
        done()
      }
    })
  })

  it('test success', function (done) {
    jpm_report.parseReport('test-data/success.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        res = JSON.parse(res)
        assert.equal(res.success.total_success, res.success.total_tests)
        done()
      }
    })
  })

  it('test success with errors after', function (done) {
    jpm_report.parseReport('test-data/success-error.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        res = JSON.parse(res)
        assert.equal(res.success.total_success, res.success.total_tests)
        done()
      }
    })
  })
})

describe('testing junit output: success', function () {
  it('test success', function (done) {
    jpm_report.parseReport('test-data/success.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        fs.writeFileSync('test-data/success.json', res)
        var inJSON = fs.readFileSync('test-data/success.json')
        jpm_report.outputJUnit2File(inJSON, 'test-data/success.xml', function cbOutputJUnitFile(exitCode) {
          assert.ok('success')
          done()
        })
      }
    })
  })

    it('test fail', function (done) {
    jpm_report.parseReport('test-data/failure.txt', 'json', function cb_parse_report (err, res) {
      if (err) {
        assert.equal('should not have an error', err)
        done()
      } else {
        fs.writeFileSync('test-data/failure.json', res)
        var inJSON = fs.readFileSync('test-data/failure.json')
        jpm_report.outputJUnit2File(inJSON, 'test-data/failure.xml', function cbOutputJUnitFile(exitCode) {
          assert.ok('success')
          done()
        })
      }
    })
  })
})
