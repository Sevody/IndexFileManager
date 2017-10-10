const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const ffmetadata = require('ffmetadata')
const { travel, isEqualDir } = require('../src/lib/helper')
const { rename, remeta, WinRAR } = require('../index')
const TESTRAR = './test/testrar'
const TESTRENAME = './test/testrename'
const TESTREMETA = './test/testremeta'
const SOURCE = './test/source'
const TARGET = './test/target'

describe('helper', function() {
  describe('travel', function() {
    it('should get the list of name from directory', function() {
      const files = []
      travel(TESTRAR, (filenames) => {
        files.push(filenames)
      })
      expect(files).to.have.lengthOf(fs.readdirSync(TESTRAR).length)
    })
  })
  describe('isEqualDir', function() {
    it('should get true with same directory', function() {
      expect(isEqualDir(TESTRAR, TESTRAR)).to.be.true
    })
  })
})

describe('rename', function() {
  beforeEach(function() {
    fs.removeSync(SOURCE)
    fs.copySync(TESTRENAME, SOURCE)
  })
  describe('order name', function() {
    it('should set a sequence name for all files in directory', function() {
      rename(SOURCE, {
        prefix: 'T'
      })
      const distName = path.basename(fs.readdirSync(SOURCE)[0]).split('.')[0]
      expect(distName).to.equal('T1')
    })
  })
})

describe('remeta', function() {
  beforeEach(function() {
    fs.removeSync(SOURCE)
    fs.copySync(TESTREMETA, SOURCE)
  })
  describe('mp3 meta', function() {
    it('should set meta info to mp3 file', async function() {
      await remeta(path.join(SOURCE, 'mp3'), {
        artist: 'Aimer',
        album: '花の唄',
        atmpath: path.join(SOURCE, 'COVER.jpg')
      })
      const file = path.resolve(path.join(SOURCE, 'mp3/花の唄.mp3'))
      ffmetadata.read(file, function(err, data) {
        expect(data.artist).to.equal("Aimer");
      });
    })
  })
})

describe('winrar', function() {
  beforeEach(function() {
    fs.removeSync(SOURCE)
    fs.copySync(TESTRAR, SOURCE)
    fs.emptyDirSync(TARGET)
  })
  describe('source', function() {
    it('should have the copies of testrar', function() {
      expect(isEqualDir(TESTRAR, SOURCE)).to.be.true
    })
  })
  describe('zip', function() {
    it('should zip the directory to rar file', function() {
      const testDir = path.join(SOURCE, 'test')
      const targetFile = path.join(TARGET, 'test.rar')
      const winrar = new WinRAR({
        targetDir: testDir
      })
      winrar.zip(targetFile)
      expect(fs.pathExistsSync(targetFile))
    })
  })
  describe('unzip', function() {
    describe('unzip rar file', function() {
      it('shold unzip the rar file to directory', function() {
        const testFile = path.join(SOURCE, 'test.rar')
        const targetDir = TARGET
        winrar = new WinRAR({
          targetDir: targetDir
        })
        winrar.unzip(testFile)
        expect(isEqualDir(path.join(SOURCE, 'test'), path.join(targetDir, 'test'))).to.be.true
      })
    })
    describe('unzip encrypted rar file', function() {
      it('shold unzip the encrypted rar file to directory', function() {
        const testFile = path.join(SOURCE, 'testpass.rar')
        const targetDir = TARGET
        winrar = new WinRAR({
          targetDir: targetDir,
          password: '123'
        })
        winrar.unzip(testFile)
        expect(isEqualDir(path.join(SOURCE, 'test'), path.join(targetDir, 'testpass'))).to.be.true
      })
    })
  })
})