const fs = require('fs')
const path = require('path')

function recompose(target, source, sp) {
  return new Promise((resolve, reject) => {
    const dir = fs.readdirSync(target)
    function next(i) {
      if(i >= dir.length) {
        return resolve()
      }
      const dirname = dir[i]
      const dirpath = path.resolve(path.join(target, dirname))
      let flag = dirname
      if (sp) {
        flag = dirname.split(sp)[0]
      }
      fs.readdirSync(source).forEach(zip => {
        if (flag&&zip.includes(flag)) {
          const oldPath = path.join(source, zip)
          const newPath = path.join(dirpath, zip)
          try {
            fs.renameSync(oldPath, newPath);
           }
           catch (e) {
             console.log('renameSync error: ', e)
            fs.renameSync(oldPath, newPath);
           }
        }
      })
      next(++i)
    }
    next(0)
  })
}

module.exports = recompose