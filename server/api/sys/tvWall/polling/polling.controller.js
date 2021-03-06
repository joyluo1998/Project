/*
 * 轮询接口
 * @Author: chenkaibo
 * @Date: 2018-06-06 15:03:16
 * @Last Modified by: chenkaibo
 * @Last Modified time: 2018-09-14 15:10:10
 */

'use strict'
const mongoose = require('mongoose')
const Polling = mongoose.model('Polling')
const { checkAddName, checkModifyName } = require('../tool')
const ObjectID = mongoose.mongo.ObjectID
const Wall = mongoose.model('Wall')
const { handleSysException, transferPinyin } = require('../../../../common/tools')
const Monitor = mongoose.model('Monitor')
const Scene = mongoose.model('Scene')
const { execPolling } = require('../../../bstar/tvwall.interface')
const _ = require('lodash')

exports.getOne = async ctx => {
  try {
    ctx.set('loginfo', encodeURI('电视墙-获取轮询'))
    const polling = await Polling.findById(ctx.params.id).populate({ path: 'channels', select: 'name' }).exec()
    ctx.status = 200
    ctx.body = polling
  } catch (error) {
    handleSysException(error)
  }
}
exports.add = async ctx => {
  try {
    ctx.set('loginfo', encodeURI('电视墙-添加轮询'))
    ctx.request.body.pinyin = transferPinyin(ctx.request.body.name)
    const res = await checkAddName(Polling, ctx.request.body.name, ctx.request.body.wall)
    if (res) {
      ctx.throw(500, { code: 5, message: '该名称已存在' })
    }
    const polling = new Polling(ctx.request.body)
    const doc = await polling.save()
    ctx.status = 201
    ctx.set('Location', `/polling/${doc._id}`)
    ctx.body = [doc._id]
  } catch (err) {
    handleSysException(err)
  }
}

exports.modify = async ctx => {
  try {
    ctx.set('loginfo', encodeURI('电视墙-修改轮询'))
    const res = await checkModifyName(Polling, ctx.params.id, ctx.request.body.name, ctx.request.body.wall)
    if (res) {
      ctx.throw(500, { code: 5, message: '该名称已存在' })
    }
    if (!ctx.request.body.wall) {
      ctx.throw(500, { code: 9, message: '参数不能为空' })
    }
    const wallInfo = await Wall.findById(ctx.request.body.wall).populate({ path: 'rtscene', select: 'polling' }).exec()
    if (!_.isEmpty(wallInfo)) {
      if (ctx.params.id + '' === wallInfo.rtscene.polling + '') { ctx.throw(500, { code: 7, message: '正在执行，不能修改' }) }
    }
    await Polling.findByIdAndUpdate(ctx.params.id, ctx.request.body).exec()
    ctx.status = 200
  } catch (err) {
    handleSysException(err)
  }
}

exports.delete = async ctx => {
  try {
    ctx.set('loginfo', encodeURI('电视墙-删除轮询'))
    if (!ctx.query.wall) {
      ctx.throw(500, { code: 9, message: '参数不能为空' })
    }
    const wallInfo = await Wall.findById(ctx.query.wall).populate({ path: 'rtscene', select: 'polling' }).exec()
    if (ctx.params.id + '' === wallInfo.rtscene.polling + '') { ctx.throw(500, { code: 8, message: '正在执行，不能删除' }) }
    await Polling.findByIdAndRemove(ctx.params.id).exec()
    ctx.status = 200
  } catch (err) {
    handleSysException(err)
  }
}
exports.exec = async ctx => {
  try {
    ctx.set('loginfo', encodeURI('电视墙-执行轮询'))
    const id = ctx.request.body.id
    const pollingInfo = await Polling.findById(id).populate({ path: 'channels', select: 'ip port eid chan stream', populate: { path: 'eid', select: 'cport dport' } }).exec()
    const monitorInfos = []
    let rqScene = await Scene.find({ wall: pollingInfo.wall, name: '实时场景' }).exec()
    rqScene = rqScene[0].toObject()
    // 过滤实时场景中与轮询配置监视器相匹配的对象,主要为了匹配窗格分割
    for (var item of pollingInfo.monitorsinfo) {
      for (var item2 of rqScene.info) {
        if (item + '' === item2.monitor + '') {
          const monitorInfo = await Monitor.findById(item2.monitor).populate([
            {
              path: 'channel',
              select: 'chan'
            },
            {
              path: 'equipment',
              select: 'ip cport'
            }
          ]).exec()
          item2.type = 1
          monitorInfos.push({
            monitorInfo,
            paneCount: item2.panecount
          })
        }
      }
    }
    const body = {
      cameraGroup: {
        cameraList: !pollingInfo ? [] : pollingInfo.channels.map(item => {
          return {
            devIp: item.ip,
            devPort: item.eid.cport,
            channel: item.chan,
            stream: item.stream,
            streamConnPort: item.eid.dport
          }
        }),
        interval: !pollingInfo ? 0 : pollingInfo.interval
      },
      monitorConf: monitorInfos && monitorInfos.map(item => {
        return {
          devIp: item.monitorInfo.equipment.ip,
          devPort: item.monitorInfo.equipment.cport,
          monitor: item.monitorInfo.channel.chan,
          paneCount: item.paneCount,
          paneTag: item.monitorInfo.startcode
        }
      })
    }
    console.log(JSON.stringify(body))
    try {
      await execPolling(ctx, body)
    } catch (error) {
      return ctx.throw(500, { code: error.error, message: '请求第三方接口异常', type: 'sys' })
    }
    !rqScene.polling && (rqScene.polling = [])
    rqScene.polling.push(id)
    rqScene.polling = [...new Set(rqScene.polling)].map(item => ObjectID(item))
    await Scene.findByIdAndUpdate(rqScene._id, rqScene).exec()
    await Wall.findByIdAndUpdate(rqScene.wall, { selectedplan: null }).exec()
    ctx.status = 200
  } catch (err) {
    handleSysException(err)
  }
}
// 删除关联视频通道(删除视频通道)
exports.updatePollingResource = async data => {
  try {
    const pollings = await Polling.find({}).exec()
    const { resources } = data
    const pollLength = pollings ? pollings.length : 0
    const resLehgth = resources ? resources.length : 0
    for (let i = 0; i < resLehgth; i++) {
      // const monitor = await Monitor.find({ channel: resources[i] }).exec()
      for (let j = 0; j < pollLength; j++) {
        pollings[j].channels && pollings[j].channels.forEach(async item => {
          if ((item + '') === (resources[i]._id + '')) {
            // 删除对应通道
            if (item instanceof ObjectID) {
              pollings[j].channels.deleteMany(item)
            } else {
              pollings[j].channels.deleteMany(item + '')
            }
          }
        })
      }
    }
    pollings.forEach(item => Polling.findByIdAndUpdate(item._id, item))
  } catch (error) {
    // obj.ctx.throw(500, { code: 1, message: '系统内部错误' })
    console.log(error)
  }
}
// 删除关联解码器位置(删除解码器)
exports.updatePollingMonitorPosition = async monitors => {
  try {
    const pollings = await Polling.find({}).exec()
    // 解码器位置
    const positions = monitors
    const pollLength = pollings ? pollings.length : 0
    const posLehgth = positions ? positions.length : 0
    for (let i = 0; i < posLehgth; i++) {
      for (let j = 0; j < pollLength; j++) {
        pollings[j].monitorsinfo && pollings[j].monitorsinfo.forEach(async item => {
          if ((item + '') === (positions[i]._id + '')) {
            // 删除对应监视器位置
            if (item instanceof ObjectID) {
              pollings[j].monitorsinfo.deleteMany(item)
            } else {
              pollings[j].monitorsinfo.deleteMany(item + '')
            }
          }
        })
      }
    }
    pollings.forEach(item => Polling.findByIdAndUpdate(item._id, item))
  } catch (error) {
    // ctx.throw(500, { code: 1, message: '系统内部错误' })
    console.log(error)
  }
}

// 更新单个资源通道
exports.updateOnePollingResource = async resource => {
  try {
    const pollings = await Polling.find({}).exec()
    pollings && pollings.forEach(async item => {
      item.channels = item.channels.filter(item => item + '' !== resource._id + '')
      await item.save()
    })
  } catch (error) {
    console.log(error)
  }
}

// 更新单个解码器通道
exports.updateOnePollingMonitorPosition = async monitor => {
  try {
    const pollings = await Polling.find({}).exec()
    pollings && pollings.forEach(async item => {
      item.monitorsinfo = item.monitorsinfo.filter(item => item + '' !== monitor._id + '')
      await item.save()
    })
  } catch (error) {
    console.log(error)
  }
}
