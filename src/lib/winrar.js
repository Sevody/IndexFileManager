'use strict';
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const _ = require('lodash')

class WinRAR {
  constructor(opts) {
    const defaultOpts = {
      cwd: this.getExePath(),
      encoding:'binary',
    }
    this.options = _.assign({}, defaultOpts, opts)
    this.options.password = this.options.password ? `-p${this.options.password}` : ''
  }
  config(opts) {
    this.options = _.assign({}, this.options, opts)
    return this
  }
  zip(file) {
    const opts = this.options
    const cmd = `rar a -ep ${file} ${opts.targetDir}`
    // 'rar a -eq num_all.rar .\test_data'
    this.run(cmd)
  }
  unzip(file) {
    const opts = this.options
    const cmd = `rar e ${opts.password} ${file} ${opts.targetDir}`
    // 'rar e  num_all_tg.zip .\test_d2'
    this.run(cmd)
  }
  run(cmd) {
    const opts = this.options
    try {
      cp.execSync(cmd, {
        cwd: opts.cwd,
        encoding: opts.encoding
      })
    } catch(err) {
      console.log('zip error: ', err.stack)
      this.processError(err, opts)
    }
  }
  processError(err, opts) {

  }
  fixPath(path) {
    return path.replace(/\\/g, '\\\\')
  }
  getExePath() {
    const winRARVal = cp.execSync('reg query HKEY_CLASSES_ROOT\\WinRAR\\shell\\open\\command /ve', {encoding: 'utf-8'});
    return winRARVal.match(/\"([^\"]+)\\.+\"/)[1]
  }
}

module.exports = WinRAR

