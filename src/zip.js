let fs = require('fs')
let path = require('path')
const WinRAR = require('./lib/winrar')

const winrar = new WinRAR({
  targetDir: 'E:\\Mylist\\azip\\test\\tmp\\',
  password: '123'
})
winrar.zip('E:\\Mylist\\azip\\test\\test.rar')

