'use strict';
const fse = require('fs-extra')
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
  zip(target) {
    const opts = this.options
    const targetFile = path.join(opts.dist, path.basename(target).concat('.rar'))
    fse.ensureDirSync(target)
    const cmd = `winrar a -ep ${path.resolve(targetFile)} ${path.resolve(target)}`
    // 'rar a -eq num_all.rar .\test_data'
    this.run(cmd)
  }
  unzip(target) {
    if (!fs.existsSync(target)) return
    if (fs.statSync(target).isDirectory()) {
      fs.readdirSync(target).map(file => {
        this.unzip(path.join(target, file))
      })
    }
    const names = path.basename(target).split('.')
    const isZipFile = names[1] && /^(rar|zip|7z)$/.test(names[1])
    if (!isZipFile) return
    const opts = this.options
    const targetDir = path.join(opts.dist, names[0]) 
    fse.ensureDirSync(targetDir)
    const cmd = `winrar e ${opts.password} ${path.resolve(target)} ${path.resolve(targetDir)}`
    // 'rrarar e  num_all_tg.zip .\test_d2'
    console.log('processing: ', cmd)
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
    // TO DO
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

