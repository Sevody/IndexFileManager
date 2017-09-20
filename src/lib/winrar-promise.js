const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const fileExists = require('file-exists');
const mime = require('mime');
const shellescape = require('shell-escape');


const File = function (filePath = false) {
  this.file = [];
  this.archiveFile = [];
  if(filePath) {
    if(typeof filePath == 'object') {
      this.file = this.file.concat(filePath);
    } else {
      this.file.push(filePath)
    }
  }
}

File.prototype.addFile = function (filePath = false) {
  if(typeof filePath == 'object') {
    this.file = this.file.concat(filePath);
  } else {
    this.file.push(filePath)
  }
}

File.prototype.setArchiveFile = function (filePath = false) {
  if(typeof filePath == 'object') {
    this.archiveFile = this.archiveFile.concat(filePath);
  } else {
    this.archiveFile.push(filePath)
  }
}

File.prototype.setOutput = function (outputPath) {
  this.output = outputPath;
}

File.prototype.setConfig = function (opt) {
  if(opt.password) this.password = opt.password;
  if(opt.comment) this.comment = opt.comment;
  if(opt.volumes) this.volumes = opt.volumes;
  if(opt.deleteAfter) this.deleteAfter = opt.deleteAfter;
  if(opt.keepBroken) this.keepBroken = opt.keepBroken;
  if(opt.level) this.level = opt.level;

}
  
File.prototype.rar = function() {
  return new Promise((resolve, reject) => {
    if(!checkField([this.output, this.file])) reject({message: `Input and Output file are required!`})
    let command = [`${__dirname}/rar`,`a`,`-ep`,`-o+`];
    if(this.password) command.push(`-p${this.password}`);
    if(this.volumes) command.push(`-v${this.volumes*1024}`);
    if(this.deleteAfter) command.push(`-df`);
    if(this.level) command.push[`-m${this.level}`];
    if(fileExists.sync(this.output)) fs.unlinkSync(this.output);
    command.push(`${this.output}`);
    this.file.forEach((file) => {
      if(!fileExists.sync(file)) reject({message: `file didn't exist: ${file}`});
      command.push(file);
    })
    command = shellescape(command);
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(parseRar(res));
    })
  })
}

File.prototype.unrar = function() {
  return new Promise((resolve, reject) => {
    if(mime.lookup(this.file[0]) != 'application/x-rar-compressed') reject({message: `Please select rar file`});
    if(!checkField([this.output, this.file])) reject({message: `Input and Output file are required!`})
    let command = [`${__dirname}/unrar`, 'e', '-o+'];
    if(this.password) {command.push(`-p${this.password}`);} else {command.push(`-p-`)};
    if(this.deleteAfter) command.push('-df');
    command.push(this.file[0]);
    this.archiveFile.forEach((file) => {
      command.push(file);
    })
    command.push(this.output);
    command = shellescape(command);
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(parseUnrarError(err));
      else resolve(parseUnrar(res));
    })
  })
}

File.prototype.listFile = function () {
  return new Promise((resolve, reject) => {
    let command = [];
    command.push(`${__dirname}/unrar`);
    command.push('l');
    if(this.password) command.push(`-p${this.password}`);
    this.file.forEach((file) => {
      if(mime.lookup(file) != 'application/x-rar-compressed') {reject({message: `Please select rar file`}); throw 'err'}
      if(!fileExists.sync(file)) {reject(`file didn't exist: ${file}`); throw 'err'}
      command.push(`${file}`);
    })
    command = shellescape(command);
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(parseList(res));
    })
  })
}

File.prototype.zip = function () {
  return new Promise((resolve, reject) => {
    if(fileExists.sync(this.output)) fs.unlinkSync(this.output);
    let command = [];
    Array.prototype.push.apply(command, ['zip', '-q', '-j', `${this.output}`]);
    this.file.forEach((file) => {
      command.push(file);
    })
    command = shellescape(command);
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve({fileName: path.basename(this.output), filePath: this.output});
    })
  })
}

File.prototype.unzip = function () {
  return new Promise((resolve, reject) => {
    let command = [];
    Array.prototype.push.apply(command, ['unzip', '-j', '-o', '-U', `${this.file[0]}`, '-d', `${this.output}`]);
    command = shellescape(command);
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(parseUnzip(res));
    })
  })
}

function parseUnzip(res) {
  res = res.split('\n');
  res.splice(0, 1);
  res.splice(res.length -1, 1);
  let output = [];
  res.forEach((item) => {
    item = item.trim().replace('inflating: ', '');
    output.push({fileName: path.basename(item), filePath: item});
  })
  return output;
}

function checkField(arr) {
  let output = true;
  arr.forEach((item) => {
    if(!item || typeof item == 'undefined' || item == 'undefined') output = false;
  })
  return output;
}

function parseList(res) {
  res = res.split('----------- ---------  ---------- -----  ----')[1].trim();
  res = res.split('\n');
  let output = [];
  let password = false;
  res.forEach((item, index) => {
    item = item.trim();
    item = item.replace(/\s\s+/g, ' ').split(' ');
    let ind = 0;
    try {
      item.forEach((tes, index) => {
        if(index == 0) {
          if(/\*/g.test(tes)) password = true;
        }
        if(parseInt(tes) > 0) {
          ind = index;
          throw 'stop';
        }
      })
    } catch (e) {

    }
    item.splice(0, ind);
    let files = {size: item[0], date: item[1] + ' ' + item[2]};
    item.splice(0, 3);
    item = item.join(' ');
    files.path = item;
    files.fileName = path.basename(item);
    output.push(files);
  })
  output['password'] = password;
  return output;
}

function parseUnrar(res) {
  res2 = res.match(/Extracting +.+OK/g);
  if(!res2) res2 = res.match(/Extracting+.+\/+.+\%/g);
  let output = [];
  res2.forEach((item) => {
    let filePath = item.replace('Extracting', '').replace(/\s\s\s+.+/g, '').trim();
    output.push({fileName: path.basename(filePath), filePath});
  })
  return output;

}

function parseUnrarError(res) {
  let error = {};
  if(/Corrupt file or wrong password/gi.test(res.message)) {
    error.code = 1;
    error.message = 'Corrupt file or wrong password';
  } else {
    error.code = 0;
    console.log(res);
    error.message = 'Unknown error';
  }
  return error;
}

function parseRar(res) {
  res = res.match(/Creating archive+.+/gi);
  let output = [];
  res.forEach((item, index) => {
    try {
      filePath = item.replace('Creating archive ', '').trim();
      if(res.length > 1 && index == 0) filePath = filePath.replace('.rar', `.part${pad(1, res.length.toString().length)}.rar`);
      output.push({fileName: path.basename(filePath), filePath});
    } catch (e) {
      console.log(e);
      throw e.message;
    }
  })
  return output;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = File;