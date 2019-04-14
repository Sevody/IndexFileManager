const { recompose } = require('../index')
const TARGET = 'K:\\BD\\大老师'
const SOURCE = 'K:\\BD\\fff'
const SP = '('
recompose(TARGET, SOURCE, SP)
console.log('recompose success!!!')