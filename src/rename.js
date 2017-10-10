const fs = require('fs')
const path = require('path')
const { travel } = require('./lib/helper')
const deepTravel = false
let prefix = ''
let suffix = 1
 
function rename(srcDir, opts) {
  prefix = opts.prefix || ''
  travel(srcDir, processFile, deepTravel)
}

function processFile(filename) {
  if (fs.statSync(filename).isFile) {
    const targetName = `${prefix}${suffix++}${path.extname(filename)}`
    const distName = path.join(path.dirname(filename), targetName)
    fs.renameSync(filename, distName)
  }
}

module.exports = rename