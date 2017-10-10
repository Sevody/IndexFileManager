const fs = require('fs')
const path = require('path')
const ffmetadata = require('ffmetadata')

let imagePath = './test.png'

function remetadata(dir) {
    fs.readdirSync(dir).map((filename) => {
        const filepath = path.join(dir, filename)
        let data = {
            title: filename.split('.')[0],
            artist: 'test',
            album: 'test'
        }
        let atmpath = path.join(dir, imagePath)
        let op = {
            "id3v2.3": true,
            attachments: [atmpath]
        }
        ffmetadata.write(filepath, data, op, (err) => {
            if (err) throw err
            else console.log('rewrite', op)
        })
    })
}

module.exports = remetadata
