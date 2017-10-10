const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const { travel, isEqualDir } = require('../src/lib/helper')
const { WinRAR } = require('../index')
const TESTRAR = './test/testrar'
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