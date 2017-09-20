let fs = require('fs')
let path = require('path')
var winRar = require('./lib/win-rar/sync.js');
var rar=new winRar({
   inDir:'E:\\Mylist\\azip\\test\\56x56.rar',
   outDir:'E:\\Mylist\\azip\\test\\tmp',
   name:'',
   cwd:'E:\\Mylist\\azip\\test',
   cmd:'e',
   ny:['-p12'],
   filter:function(name){return true}
});
// rar.compress();

const WinRAR = require('./lib/winrar')
const winrar = new WinRAR({
  targetDir: 'E:\\Mylist\\azip\\test\\tmp\\',
  password: '123'
})
winrar.unzip('E:\\Mylist\\azip\\test\\56x56.rar')
// winrar.zip('E:\\Mylist\\azip\\test\\test.rar')

