const fs = require('fs')
const path = require('path')
const ffmetadata = require('ffmetadata')

function remetadata(dir, opts) {
  return new Promise((resolve, reject) => {
    const {
      artist,
      album,
      atmpath
    } = opts
    const files = fs.readdirSync(dir)
    function next(i) {
      if(i >= files.length) {
        return resolve()
      }
      const filename = files[i]
      const filepath = path.resolve(path.join(dir, filename))
      let data = {
        title: filename.split('.')[0],
        artist,
        album
      }
      let op = {
        "id3v2.3": true,
        attachments: [path.resolve(atmpath)]
      }
      ffmetadata.write(filepath, data, op, (err) => {
        if (err) {
          reject(err)
        }
        else {
          next(++i)
        }
      })
    }
    next(0)
  })
}

module.exports = remetadata