'use strict'

/* global describe it */
var assert = require('assert')
var jpm_report = require('../src/index.js')

describe('Checking args', function () {
  it('with no args', function cb_parse_args_zero (done) {
    jpm_report.checkArgs(['node', 'jpm_report'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('Please use --version', err)
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
    jpm_report.checkArgs(['node', 'jpm_report', 'bin/jpm-report'], function cb_parse_args (err, res) {
      if (err) {
        assert.fail('should not have an error')
        done()
      } else {
        assert.equal("I'm a file", res)
        done()
      }
    })
  })

  it('with more then one arg', function cb_parse_args_two (done) {
    jpm_report.checkArgs(['node', 'jpm_report', 'do', 'stuff'], function cb_parse_args (err, res) {
      if (err) {
        assert.equal('ERROR: too many arguments, please use --help', err)
        done()
      }
    })
  })
})
