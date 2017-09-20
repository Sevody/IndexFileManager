'use strict';
var fs=require('fs');
var cp=require('child_process');
var path=require('path');
var extend=require('extend');


function getRarPath(){
  var that=this;
  var winRARVal=cp.execSync("reg query HKEY_CLASSES_ROOT\\WinRAR\\shell\\open\\command /ve",{encoding:'utf-8'});
  return winRARVal.match(/\"([^\"]+)\"/)[1];
}

function dirListTostring(files,filter,path){
  var str='';
  filter=filter||function(){return true};
  files.forEach(function(o,i){
    var isOk=filter(o);
    if(isOk){
      str+=path+"\\"+o+" ";
    }         
  });
  return str;
}
function getDir(pDir){
  var res=[];
  if(fs.existsSync(pDir)){
    res=fs.readdirSync(pDir); 
  }
  return res;
}

var defaultOpts={
   inDir:'./',
   outDir:'./',
   name:'default.rar',
   cwd:'./',
   cmd:'a',
   ny:[''],
   filter:function(){return true}
}

function Rar(opts){
    this.options=extend({},defaultOpts,opts);
    this.init();
};

Rar.prototype={
  init:function(){
     var opts=this.options;  
     this.rarCmd=this.getCmdStr(opts);
     this.cwd=path.dirname(getRarPath())||opts.cwd;
  },
  run:function(opts){
     var opts=extend({},{encoding:'binary'},opts);
     try {
       cp.execSync(opts.cmd,{cwd:this.cwd,encoding:opts.encoding});
       console.log('创建成功！'); 
     } catch (err) {
       console.log('zip error: ', err)
     }
  },
  //对外接口
  compress:function(){
    var opts=this.options;
    console.log(this.rarCmd,this.cwd);
    this.run({cmd:this.rarCmd,cwd:this.cwd})
  },  
  //获取压缩命令的字符串拼接
  getCmdStr:function(opts){
    if(!fs.existsSync(opts.inDir))return;
    if(!fs.existsSync(opts.outDir)){
       fs.mkdirSync(opts.outDir);
    }
    var cmdStr;
    var nys=opts.ny.join(' ');
    var inDir=opts.inDir;
    var files=inDir//dirListTostring(getDir(inDir),opts.filter,inDir);
    var out=path.normalize(opts.outDir+'/'+opts.name);//输出
    cmdStr='rar '+opts.cmd+' '+nys+' '+files+' '+out+'';
    return  cmdStr;
  }
};


module.exports=Rar;