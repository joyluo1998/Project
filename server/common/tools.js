var bcrypt = require('bcryptjs')
var moment = require('moment')
var crypto = require('crypto')
var SALT_WORK_FACTOR = 10
const fs = require('fs')
const path = require('path')
const koaBody = require('koa-body')
const defineOpt = require('../config/operation.config')
const _ = require('lodash')
const errorMsg = require('./error.msg')
const pinyin = require('chinese-to-pinyin')

// const _ = require('lodash')

moment.locale('zh-cn') // 使用中文

// 格式化时间
exports.formatDate = (date, friendly) => {
  date = moment(date)
  if (friendly) {
    return date.fromNow()
  } else {
    return date.format('YYYY-MM-DD HH:mm')
  }
}

exports.validateId = str => {
  return /^[a-zA-Z0-9\-_]+$/i.test(str)
}

// bcrypt.js hash加密
exports.bhash = async str => {
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
  const hash = await bcrypt.hash(str, salt)
  return hash
}

// bcrypt.js加密校验
exports.bcompare = async (str, hash) => {
  const result = await bcrypt.compare(str, hash)
  return result
}

/**
 * 树形结构转换
 * @param a 数据数组
 * @param idStr id字符串
 * @param pidStr 父id字符串
 * @returns {Array}
 */
exports.transData2Tree = (a, idStr, pidStr, sort = false) => {
  var r = []
  var hash = {}
  var len = a.length
  for (var i = 0; i < len; i++) {
    hash[a[i][idStr]] = a[i]
  }
  for (var j = 0; j < len; j++) {
    var aVal = a[j]
    var hashVP = hash[aVal[pidStr]]
    if (hashVP) {
      !hashVP.children && (hashVP.children = [])
      if (sort) {
        hashVP.children.unshift(aVal)
      } else {
        hashVP.children.push(aVal)
      }
    } else {
      r.push(aVal)
    }
  }
  return r
}

/**
 * 返回一个节点下的所有子孙节点
 * @param arr 返回数组
 * @param result 传入数据
 * @param 父节点id
 */
const getChildren = (arr, result, pid) => {
  for (var i in result) {
    if (result[i].pid && result[i].pid + '' === pid + '') {
      arr.push(result[i]._id + '')
      getChildren(arr, result, result[i]._id)
    }
  }
  return arr
}

exports.getChildren = getChildren

/**
 * 树形结构转化（新） 支持指定根节点开始
 * @param {*} result // 数据结果集
 * @param {*} idStr // id标识
 * @param {*} pidStr // pid标识
 * @param {*} pidVal // 指定顶级目录Pid值（选填，默认查询所有结构树）
 */
const transData2TreeNew = (result, idStr, pidStr, pidVal) => {
  pidVal = pidVal || result[idStr]
  var rtn = []
  for (var i in result) {
    if (result[i][pidStr] === pidVal) {
      const childrenData = transData2TreeNew(result, idStr, pidStr, result[i][idStr])
      if (childrenData.length > 0) {
        result[i].children = childrenData
      }
      // result[i].children = transData2TreeNew(result, idStr, pidStr, result[i][idStr]) // 前端要求去掉children为空的情况
      rtn.push(result[i])
    }
  }
  return rtn
}
exports.transData2TreeNew = transData2TreeNew

/**
 * 根据组织结构数据/通道数据  组织树形结构
 * @param {*} result // 组织结构数据
 * @param {*} idStr // id标识
 * @param {*} pidStr // pid标识
 * @param {*} resouces // 通道资源数据
 * @param {*} pidVal // 指定顶级目录Pid值（选填，默认查询所有结构树）
 * @param {*} tempObj //临时对象（递归使用，不填）
 * @param {*} index  //临时数字（递归使用，不填）
 */

const transData2TreeNewWithResouce = (result, idStr, pidStr, resouces, pidVal, tempObj, index = 0) => {
  pidVal = pidVal || result[idStr]
  tempObj = tempObj || {}
  if (index === 0) {
    for (var j = 0; j < resouces.length; j++) {
      const tempRid = resouces[j]['oid']
      if (tempObj[tempRid]) {
        tempObj[tempRid].push(resouces[j])
      } else {
        tempObj[tempRid] = [resouces[j]]
      }
    }
  }
  var rtn = []
  for (var i in result) {
    index++
    if (result[i][pidStr] === pidVal) {
      const resourcesArr = tempObj[result[i][idStr]]
      if (resourcesArr) {
        result[i].children = tempObj[result[i][idStr]].concat(
          transData2TreeNewWithResouce(result, idStr, pidStr, resouces, result[i][idStr], tempObj, index)
        )
      } else {
        result[i].children = transData2TreeNewWithResouce(
          result,
          idStr,
          pidStr,
          resouces,
          result[i][idStr],
          tempObj,
          index
        )
      }
      rtn.push(result[i])
    }
  }
  return rtn
}
exports.transData2TreeNewWithResouce = transData2TreeNewWithResouce

exports.md5 = function (str) {
  var md5sum = crypto.createHash('md5')
  md5sum.update(str)
  str = md5sum.digest('hex')
  return str
}
// create folders
function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
exports.mkdirsSync = mkdirsSync

exports.handleSysException = (err, code, message) => {
  // 数据库错误信息处理
  console.log(err)
  if (err.name === 'ValidationError') {
    const message = err.message.split(':')
    err = { message: message[message.length - 1] }
    err.code = code || 500
    throw err
  }
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    err = { message: '参数id不合法' }
    err.code = code || 500
    throw err
  }
  if (err.name === 'MongoError' && err.code === 11000) {
    const match = err.message.match(/"(.)*"/)
    err = { message: match[0].replace(/"/g, '') + '已存在' }
    err.code = code || 500
    throw err
  }
  // 应用错误信息处理
  if (err.code) {
    if (errorMsg[err.code]) {
      err.message = errorMsg[err.code]
    }
    throw err
  } else {
    err.code = code || 500
    err.message = err.message || '系统内部错误'
    throw err
  }
}

exports.injectLogToCtx = (ctx, operation, levelName = 'loginfo') => {
  const name = _.get(defineOpt, operation)
  if (name) {
    ctx.set(levelName, encodeURI(name))
  } else {
    ctx.set(levelName, encodeURI('未定义的操作'))
  }
}

/**
 * 过滤两个对象，返回发生变化前和发生变化后的字段
 */
exports.filterAlterData = (oldData, newData) => {
  const alterData = []
  for (var i in oldData) {
    for (var k in newData) {
      if (oldData[i] !== newData[k] && i === k) {
        alterData.push(i)
      }
    }
  }
  return alterData
}

// 筛选数据交集(相同数据结构)
exports.filterData = (arr1, arr2) => {
  var resArr = []
  arr1.forEach(item1 => {
    const temp = arr2.filter(item2 => item1 === item2)
    if (!_.isEmpty(temp)) {
      resArr.push(temp[0])
    }
  })
  return resArr
}
/*
 * 集成权限数据
 * authResArr 权限资源
 * resArr 资源数据
*/
exports.integrationAuthData = (authDataMap, resArr) => {
  try {
    var result = []
    resArr.forEach(res => {
      if (authDataMap[res._id + '']) {
        result.push(Object.assign(res, { power: authDataMap[res._id + ''].properties }))
      }
    })
    return result
  } catch (error) {
    throw error
  }
}
// 字符串转wkt(多边形)
exports.stringToWkt = str => {
  var wktStr = ''
  const strAreaArr = str.split('|')
  for (let i = 0; i < strAreaArr.length; i++) {
    var wktItemStr = ''
    const arr = _.chunk(strAreaArr[i].split(','), 2)
    let temp
    for (let j = 0; j < arr.length; j++) {
      temp = arr[j][0] + ' ' + arr[j][1]
      if (j < arr.length - 1) {
        wktItemStr += temp + ','
      }
      if (j === arr.length - 1) {
        wktItemStr += temp
      }
    }
    if (i < strAreaArr.length - 1) {
      wktStr += '(' + wktItemStr + '),'
    }
    if (i === strAreaArr.length - 1) {
      wktStr += '(' + wktItemStr + ')'
    }
  }
  const wkt = `MULTIPOLYGON(${wktStr})`
  return wkt
}
exports.transferPinyin = name => {
  return pinyin(name, { noTone: true, filterChinese: true })
}
// 重复效验
exports.checkRepeat = async (operate, model, search, id) => {
  let flag = false
  const result = await model.find(search).exec()
  const keys = Object.keys(search)
  if (operate === 'add') {
    result.length && (flag = true)
  } else if (operate === 'update') {
    result.forEach(item => {
      keys.forEach(key => {
        if (item._id + '' !== id + '' && item[key] + '' === search[key] + '') {
          flag = true
        }
      })
    })
  }
  return flag
}
/**
 * 配置koabody上传路径
 * @param {string} filePath 上传文件的目录
 * @returns {function} 上传文件方法
 */
exports.cfgUploadDir = filePath => {
  return koaBody({
    multipart: true,
    formidable: {
      uploadDir: filePath,
      keepExtensions: true,
      onFileBegin: (name, file) => {
        const extname = path.extname(file.name)
        const newName = path.basename(file.name, extname) + new Date().getTime() + extname
        file.path = `${filePath}/${newName}`
        file.name = newName
      }
    }
  })
}
exports.sleep = async function sleep (time) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
