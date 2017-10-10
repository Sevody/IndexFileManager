const _ = require('lodash')
const path = require('path')
const fs = require('fs')

function travel(dir, cb, isDeep) {
  fs.readdirSync(dir).forEach(file => {
      let filename = path.join(dir, file)
      if (fs.statSync(filename).isDirectory() && isDeep) {
          travel(filename, cb, isDeep)
      } else {
          return cb(filename, dir)
      }
  })
}

const isEqualDir = function(d1, d2) {
  const rawFiles = []
  const targetFiles = []
  
  travel(d1, (filename) => {
    rawFiles.push(path.basename(filename))
  }, false)
  
  travel(d2, (filename) => {
    targetFiles.push(path.basename(filename))
  }, false)

  return rawFiles.length === targetFiles.length 
    && rawFiles.some((file) => {
      return !targetFiles.indexOf(file)
  })
}

module.exports = { 
  travel,
  isEqualDir,
}