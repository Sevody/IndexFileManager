let fs = require('fs')
let path = require('path')
const srcDir = '/d'
const targetDir = '/e'
const prefix = 'new'
const deepTravel = false
let suffix = 1

function travel(dir, cb, options) {
    const {isDeep} = options
    fs.readdirSync(dir).forEach(file => {
        let filename = path.join(dir, file)
        if (fs.statSync(filename).isDirectory() && isDeep) {
            travel(filename, cb)
        } else {
            return cb(filename)
        }
    })
}

function rename(srcDir) {
    travel(srcDir, processFile, {isDeep: deepTravel})
}

function processFile(filename) {
    const targetName = `${prefix}${suffix++}` 
    const distName = path.join(targetDir, targetName)
    fs.renameSync(filename, distName)
}

rename(process.argv[2])