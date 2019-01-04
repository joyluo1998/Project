/**
 * 单兵管理路由
 * @since:2018-3-8
 * @author:hansen
 */

'use strict'

const mongoose = require('mongoose')
const Org = mongoose.model('Org')
const PatrolPoint = mongoose.model('PatrolPoint')
const Security = mongoose.model('Security')
const Building3D = mongoose.model('Building3D')
const Building = mongoose.model('Building')
const PatrolRecord = mongoose.model('PatrolRecord')
const ModelService = require('../setting/model/model.service')
const modelService = new ModelService()
const postal = require('postal')
const paging = require('../../paging')
const _ = require('lodash')
const moment = require('moment')

const projection = require('@turf/projection')
const helpers = require('@turf/helpers')
const SentryService = require('./sentry.service')
const sentryService = new SentryService()
const { handleSysException, getChildren, transData2Tree } = require('../../../common/tools')
const CONSTANT = {
  ALARM: 1, // 巡更报警
  FIX: 2, // 巡更维修
  PATROL: 3, // 巡更点
  POINT: 4, // 巡更组织类型
  USER: 3, // 巡更组织类型
  TYPE: [3, 4], // 模糊查询类型 3|巡更人员，4|巡更点位
  MAP3D: '3D', // 三维地图
  PATROLMODEL: '140' // 单兵模型机构id
}
// 获取用户列表
module.exports.userList = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取用户列表'))
  try {
    const orgId = ctx.query.search.orgid
    if (_.isEmpty(orgId)) {
      ctx.throw(500, { code: 2004, message: '必须指定获取组织机构id' })
    }
    const orgs = await Org.find({ type: CONSTANT.USER }, 'name pid isroot')
      .sort('order')
      .lean()
    let refOrg = []
    if (_.isEmpty(orgId)) {
      const root = _.find(orgs, { isroot: true })
      refOrg = getChildren(refOrg, orgs, root._id.toString())
      refOrg.push(root._id.toString())
    } else {
      refOrg = getChildren(refOrg, orgs, orgId)
      refOrg.push(orgId)
    }
    const paganation = ctx.query.page || ''
    const populate = { path: 'affiliation', select: 'name' }
    const result = await paging.listQuery(
      Security,
      { affiliation: { $in: refOrg } },
      '-__v -createdAt -updatedAt -hashedPassword -salt',
      { realname: 1 },
      paganation,
      populate,
      ctx
    )
    if (_.isEmpty(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = result
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取当日正在执行任务人员信息列表（电子地图）
module.exports.userExeRrdList = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取当日正在执行任务人员信息列表'))
  try {
    const query = {}
    const key = ctx.query.search.key || ''
    const orgId = ctx.query.search.orgId || ''
    query.$and = [{ precentage: { $gt: 0 } }, { precentage: { $lt: 100 } }]
    query.date = moment(moment().format('YYYY-MM-DD')).format('X')
    const orgs = await Org.find({ type: CONSTANT.USER }, 'name pid isroot')
      .sort('order')
      .lean()
    let org = []
    if (_.isEmpty(orgId)) {
      const root = _.find(orgs, { isroot: true })
      org = getChildren(org, orgs, root._id.toString())
      org.push(root._id.toString())
    } else {
      org = getChildren(org, orgs, orgId)
      org.push(orgId)
    }
    const users = await Security.find(
      { affiliation: { $in: org }, realname: { $regex: key } },
      'realname position id photo geo'
    ).lean()
    const userIds = users.map(item => item._id.toString())
    if (_.isEmpty(userIds)) {
      ctx.status = 200
      ctx.body = []
      return
    }
    query.userId = { $in: userIds }
    const result = await PatrolRecord.find(query).lean()
    const userTask = result.map(item => {
      const user = _.find(users, usr => usr._id.toString() === item.userId.toString())
      return {
        recordId: item._id,
        userId: item.userId,
        realname: user.realname,
        position: user.position,
        photo: user.photo,
        id: user.id,
        geo: user.geo
      }
    })
    ctx.status = 200
    ctx.body = userTask
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取用户信息
module.exports.getUser = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取用户信息'))
  try {
    const id = ctx.params.id
    const result = await Security.findById(id, '-__v -createdAt -updatedAt -hashedPassword -salt')
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = result
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 修改用户信息
module.exports.updateUser = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-修改用户信息'))
  try {
    const id = ctx.params.id
    // const id = '5ab9fee079d94b22f8580c8e'
    const body = ctx.request.body
    const user = await Security.findOneAndUpdate({ _id: id }, body)
    if (_.isNull(user)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = ''
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 删除用户信息
module.exports.removeUser = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-删除用户信息'))
  try {
    const id = ctx.params.id
    const result = await Security.findByIdAndRemove(id)
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      postal.publish({ channel: 'patrol', topic: 'array.delete', data: [id] })
      ctx.status = 200
      ctx.body = ''
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 修改用户密码
exports.changePassword = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-巡更app修改用户密码'))
  try {
    let userId = ''
    if (ctx.state.user) {
      userId = ctx.state.user._id
    } else {
      ctx.throw(500, { code: 2001, message: '用户身份信息找不到，请重新登陆！' })
    }
    const oldPass = ctx.request.body.oldpwd || ''
    const newPass = ctx.request.body.newpwd || ''
    if (_.isEqual(oldPass, '') || _.isEqual(newPass, '')) {
      ctx.throw(500, { code: 2001, message: '新密码或旧密码不能为空' })
    }
    const user = await Security.findById(userId)
    if (user.authenticate(oldPass)) {
      await Security.findOneAndUpdate({ _id: userId }, { password: newPass })
      ctx.status = 200
      ctx.body = ''
    } else {
      ctx.throw(403, { code: 2001, message: '旧密码不正确' })
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 修改用户密码
exports.resetPassword = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-修改用户密码'))
  try {
    const id = ctx.params.id
    const password = ctx.request.body.pwd || ''
    const confirm = ctx.request.body.repwd || ''
    if (_.isEqual(password, '') || _.isEqual(confirm, '')) {
      ctx.throw(500, { code: 2001, message: '密码不能为空' })
    }
    if (!_.isEqual(password, confirm)) {
      ctx.throw(500, { code: 2001, message: '密码与确认密码不一致' })
    }
    await Security.findOneAndUpdate({ _id: id }, { password })
    ctx.status = 200
    ctx.body = ''
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 修改用户头像
exports.changePhoto = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-修改用户头像'))
  try {
    const id = ctx.state.user._id
    const photo = ctx.request.body.photo || ''
    if (photo === '') {
      ctx.throw(500, { code: 2001, message: '上传照片为空' })
    }
    const user = await Security.findByIdAndUpdate(id, { photo })
    if (_.isEmpty(user)) {
      ctx.throw(500, { code: 2001, message: '用户图片更新失败' })
    }
    ctx.status = 200
    ctx.body = ''
  } catch (err) {
    handleSysException(err, 2002)
  }
}

module.exports.userInfo = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取用户信息'))
  try {
    let userId = ''
    if (ctx.state.user) {
      userId = ctx.state.user._id
    } else {
      ctx.throw(500, { code: 2001, message: '用户身份信息找不到，请重新登陆！' })
    }
    const user = await Security.findById(userId, '-__v -createdAt -updatedAt -hashedPassword -salt').lean()
    if (_.isEmpty(user)) {
      ctx.throw(500, { code: 2001, message: '用户不存在' })
    }
    ctx.status = 200
    ctx.body = user
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 创建用户
module.exports.createUser = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-创建用户'))
  try {
    const body = ctx.request.body
    const result = await Security.create(body)
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '请求失败' })
    } else {
      ctx.status = 201
      ctx.headers['location'] = ctx.url + result._id
      ctx.body = [result._id]
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 批量删除用户
module.exports.batchrmUser = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-批量删除用户'))
  try {
    let ids = ctx.request.headers['x-bsc-ids']
    ids = ids.split(',')
    if (_.isEmpty(ids)) {
      ctx.throw(500, { code: 2001, message: '请选择要删除的数据' })
    }
    await Security.remove({ _id: { $in: ids } })
    postal.publish({ channel: 'patrol', topic: 'array.delete', data: ids })
    ctx.status = 200
    ctx.body = ''
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取用户树
module.exports.userTree = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取用户树'))
  try {
    const id = ctx.query.search.orgid || ''
    let orgs = await Org.find({ type: CONSTANT.USER }, 'name pid isroot')
      .sort('order')
      .lean()
    let refOrg = []
    if (id === '') {
      const root = _.find(orgs, { isroot: true })
      refOrg = getChildren(refOrg, orgs, root._id.toString())
      refOrg.push(root._id.toString())
    } else {
      refOrg = getChildren(refOrg, orgs, id)
      refOrg.push(id)
    }
    orgs = await Org.find({ _id: { $in: refOrg } }, 'name pid isroot').lean()
    orgs = orgs.map(item => {
      item.isOrg = true
      return item
    })
    const users = await Security.find({ affiliation: { $in: refOrg } }, 'realname affiliation')
      .sort('realname')
      .lean()
    for (const item of orgs) {
      item.children = []
      _.forEach(users, usr => {
        if (usr.affiliation.toString() === item._id.toString()) {
          usr.name = usr.realname
          delete usr.realname
          item.children.push(usr)
        }
      })
    }
    const treeDatas = transData2Tree(orgs, '_id', 'pid')
    if (_.isNull(treeDatas)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = treeDatas
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取巡更点位树
module.exports.pointTree = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取巡更点位树'))
  try {
    const id = ctx.query.search.orgid
    let orgs = await Org.find({ type: CONSTANT.POINT }, 'name pid isroot')
      .sort('order')
      .lean()
    let refOrg = []
    if (_.isEmpty(id)) {
      const root = _.find(orgs, { isroot: true })
      refOrg = getChildren(refOrg, orgs, root._id.toString())
      refOrg.push(root._id.toString())
    } else {
      refOrg = getChildren(refOrg, orgs, id)
      refOrg.push(id)
    }
    orgs = await Org.find({ _id: { $in: refOrg } }, 'name pid isroot').lean()
    orgs = orgs.map(item => {
      item.isOrg = true
      return item
    })
    let query = { affiliation: { $in: refOrg } }
    if (ctx.query.search.mapType === CONSTANT.MAP3D) {
      query.$or = ctx.query.storeyId
        ? [{ 'point3D.sid': ctx.query.storeyId }, { point3D: { $in: [null, undefined] } }]
        : [{ 'point3D.sid': { $in: [null, undefined] } }, { point3D: { $in: [null, undefined] } }]
    } else {
      query.$or = ctx.query.storeyId
        ? [{ 'point.sid': ctx.query.storeyId }, { point: { $in: [null, undefined] } }]
        : [{ 'point.sid': { $in: [null, undefined] } }, { point: { $in: [null, undefined] } }]
    }
    const points = await PatrolPoint.find(query, 'devName devId point point3D affiliation')
      .sort('devName')
      .lean()
    for (const item of orgs) {
      if (!item.children) {
        item.children = []
      }
      _.forEach(points, point => {
        if (point.affiliation.toString() === item._id.toString()) {
          point.name = point.devName
          point.type = 'patrol'
          delete point.devName
          item.children.push(point)
        }
      })
    }

    const treeDatas = transData2Tree(orgs, '_id', 'pid')
    if (_.isNull(treeDatas)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = treeDatas
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// // 获取指定楼宇巡更点位
// module.exports.pointBuilding = async(ctx, next) => {
//   ctx.set('loginfo', encodeURI('单兵管理-获取指定楼宇巡更点位'))
//   try {
//     const bid = ctx.params.id
//     const query = ctx.query.search.mapType === CONSTANT.MAP3D ? { 'point3D.bid': bid } : { 'point.bid': bid }
//     const result = await PatrolPoint.find(query, '-__v -createdAt -updatedAt').lean()
//     ctx.status = 200
//     ctx.body = result
//   } catch (err) {
//     handleSysException(err, 2002)
//   }
// }

// 获取指定楼宇巡更点位
module.exports.pointBuilding = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取指定楼宇巡更点位'))
  try {
    const id = ctx.params.id || ''
    const type = ctx.query.search.mapType
    const query = {}
    let Model
    let objPath
    if (_.isEmpty(id)) {
      ctx.throw(500, { code: 2004, message: '参数错误' })
    }
    if (type === CONSTANT.MAP3D) {
      Model = await Building3D.findOne({ code: id }).lean()
      if (_.isEmpty(Model)) {
        ctx.throw(500, { code: 2004, message: '没有找到该楼宇' })
      }
      objPath = 'point3D.sid'
      query['point3D.bid'] = Model._id.toString()
    } else {
      Model = await Building.findById(id).lean()
      if (_.isEmpty(Model)) {
        ctx.throw(500, { code: 2004, message: '没有找到该楼宇' })
      }
      objPath = 'point.sid'
      query['point.bid'] = id
    }
    const points = await PatrolPoint.find(query, '-__v -createdAt -updatedAt')
      .populate([{ path: 'point.bid' }, { path: 'point.sid' }])
      .populate([{ path: 'point3D.bid' }, { path: 'point3D.sid' }])
      .lean()
    const root = { _id: Model.code || Model._id, name: Model.name || '楼宇', isOrg: true, children: [] }
    if (!_.isEmpty(points)) {
      points.forEach(item => {
        const index = root.children.findIndex(node => node._id === _.get(item, objPath, {})._id)
        if (index === -1) {
          root.children.push({
            _id: _.get(item, objPath, {})._id,
            pid: Model.code || Model._id,
            name: _.get(item, objPath, {}).name,
            isOrg: true,
            children: [{ _id: item._id, name: item.devName, type: item.device, devId: item.devId }]
          })
        } else {
          root.children[index].children.push({
            _id: item._id,
            name: item.devName,
            type: item.device,
            devId: item.devId
          })
        }
      })
    }
    ctx.status = 200
    ctx.body = root
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取指定楼层巡更点位
module.exports.pointStore = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取指定楼层巡更点位'))
  try {
    const sid = ctx.params.id
    const query = ctx.query.search.mapType === CONSTANT.MAP3D ? { 'point3D.sid': sid } : { 'point.sid': sid }
    const result = await PatrolPoint.find(query, '-__v -createdAt -updatedAt').lean()
    ctx.status = 200
    ctx.body = result
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 模糊查询巡更人员与巡更点位
module.exports.List = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-模糊查询巡更人员与巡更点位'))
  try {
    const key = ctx.query.search.key.replace(/\./g, '\\.')
    const type = ctx.query.search.type
    const paganation = ctx.query.page || ''
    const query = {}
    let orgs, result
    if (_.isEmpty(type)) {
      ctx.throw(500, { code: 2004, message: '必须指定查询类型' })
    }
    if (Number(type) === CONSTANT.USER) {
      orgs = await Org.find({ type: CONSTANT.USER }, 'name pid isroot')
        .sort('order')
        .lean()
      query.$or = [{ username: { $regex: key } }, { realname: { $regex: key } }, { id: { $regex: key } }]
    } else if (Number(type) === CONSTANT.POINT) {
      orgs = await Org.find({ type: CONSTANT.POINT }, 'name pid isroot')
        .sort('order')
        .lean()
      query.$or = [{ devName: { $regex: key } }, { devCode: { $regex: key } }]
    } else {
      ctx.throw(500, { code: 2004, message: '必须指定查询类型' })
    }
    let refOrg = []
    const root = _.find(orgs, { isroot: true })
    refOrg = getChildren(refOrg, orgs, root._id.toString())
    refOrg.push(root._id.toString())
    const populate = { path: 'affiliation', select: 'name' }
    query.affiliation = { $in: refOrg }
    if (Number(type) === CONSTANT.USER) {
      result = await paging.listQuery(
        Security,
        query,
        '-__v -createdAt -updatedAt -hashedPassword -salt',
        { realname: 1 },
        paganation,
        populate,
        ctx
      )
    } else if (Number(type) === CONSTANT.POINT) {
      result = await paging.listQuery(
        PatrolPoint,
        query,
        '-__v -createdAt -updatedAt',
        { devName: 1 },
        paganation,
        populate,
        ctx
      )
    }
    ctx.status = 200
    ctx.body = result
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取巡更点位列表
module.exports.pointList = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取巡更点位列表'))
  try {
    const orgId = ctx.query.search.orgid
    if (_.isEmpty(orgId)) {
      ctx.throw(500, { code: 2004, message: '必须指定获取组织机构id' })
    }
    const orgs = await Org.find({ type: CONSTANT.POINT }, 'name pid isroot')
      .sort('order')
      .lean()
    let refOrg = []
    if (_.isEmpty(orgId)) {
      const root = _.find(orgs, { isroot: true })
      refOrg = getChildren(refOrg, orgs, root._id.toString())
      refOrg.push(root._id.toString())
    } else {
      refOrg = getChildren(refOrg, orgs, orgId)
      refOrg.push(orgId)
    }
    const paganation = ctx.query.page || ''
    const populate = { path: 'affiliation', select: 'name' }
    const result = await paging.listQuery(
      PatrolPoint,
      { affiliation: { $in: refOrg } },
      '-__v -createdAt -updatedAt',
      { devName: 1 },
      paganation,
      populate,
      ctx
    )
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = result
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取指定地图上的所有巡更点位
module.exports.getMapPointes = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取指定地图上的所有巡更点位'))
  try {
    const mapType = ctx.query.search.mapType || ''
    const id = ctx.params.id || ''
    const query = {}
    let result
    if (mapType === CONSTANT.MAP3D) {
      query.point3D = { $exists: true }
      result = await PatrolPoint.find(query, '-__v -createdAt -updatedAt')
        .populate({ path: 'point3D.bid', select: 'center' })
        .populate({ path: 'point3D.sid', select: 'name' })
        .lean()
    } else {
      if (_.isEmpty(id)) {
        ctx.throw(500, { code: 2001, message: '地图id为空' })
      }
      query['point.mapid'] = id
      result = await PatrolPoint.find(query, '-__v -createdAt -updatedAt')
        .populate({ path: 'point.bid', select: 'center' })
        .populate({ path: 'point.sid', select: 'name' })
        .lean()
    }
    const statics = { grid: [], building: [] }
    result.forEach(item => {
      let type = 'point'
      if (mapType === CONSTANT.MAP3D) {
        type = 'point3D'
      }
      // 底图上的巡更点位
      if (_.isEmpty(item[type].bid)) {
        statics.grid.push(item)
      } else {
        // 楼宇中的巡更点位
        const bid = item[type].bid._id.toString()
        const target = _.find(statics.building, ['bid', bid])
        if (target) {
          delete item[type].bid
          const sid = item[type].sid._id.toString()
          const store = _.find(target.store, ['sid', sid])
          if (store) {
            store[type].push(item)
          } else {
            target.store.push({ sid: sid, name: item[type].sid.name, point: [delete item[type].bid && item] })
          }
        } else {
          statics.building.push({
            bid: bid,
            binfo: item[type].bid,
            store: [
              {
                sid: item[type].sid._id.toString(),
                name: item[type].sid.name,
                point: [delete item[type].bid && item]
              }
            ]
          })
        }
      }

      // // 底图上的巡更点位
      // if (_.isEmpty(item.point.bid)) {
      //   statics.grid.push(item)
      // } else {
      //   // 楼宇中的巡更点位
      //   const bid = item.point.bid._id.toString()
      //   const target = _.find(statics.building, ['bid', bid])
      //   if (target) {
      //     delete item.point.bid
      //     const sid = item.point.sid._id.toString()
      //     const store = _.find(target.store, ['sid', sid])
      //     if (store) {
      //       store.point.push(item)
      //     } else {
      //       target.store.push({ sid: sid, name: item.point.sid.name, point: [delete item.point.bid && item] })
      //     }
      //   } else {
      //     statics.building.push(
      //       {
      //         bid: bid,
      //         binfo: item.point.bid,
      //         store: [
      //           {
      //             sid: item.point.sid._id.toString(),
      //             name: item.point.sid.name,
      //             point: [delete item.point.bid && item]
      //           }
      //         ]
      //       }
      //     )
      //   }
      // }
    })
    ctx.status = 200
    ctx.body = statics
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取地图底图上的所有巡更点位
module.exports.getOuterPoint = async (ctx, next) => {
  try {
    const mapType = ctx.query.search.mapType
    const query = {}
    if (mapType === CONSTANT.MAP3D) {
      query.$and = [{ point3D: { $nin: [undefined, null] } }, { 'point3D.bid': { $in: [undefined, null] } }]
    } else {
      query.$and = [{ point: { $nin: [undefined, null] } }, { 'point.bid': { $in: [undefined, null] } }]
    }
    const result = await PatrolPoint.find(query, '-__v -createdAt -updatedAt')
      .populate({ path: 'affiliation', select: 'name' })
      .populate({ path: 'point3D.mid' })
      .lean()
    ctx.status = 200
    ctx.body = result
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 获取巡更点位
module.exports.getPoint = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-获取巡更点位'))
  try {
    const id = ctx.params.id
    const result = await PatrolPoint.findById(id, '-__v -createdAt -updatedAt')
      .populate([{ path: 'affiliation', select: 'name' }, { path: 'point3D.mid' }])
      .lean()
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      result.orgName = result.affiliation.name
      result.affiliation = result.affiliation._id
      ctx.status = 200
      ctx.body = result
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 修改巡更点位
module.exports.updatePoint = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-修改巡更点位'))
  try {
    const id = ctx.params.id
    const body = ctx.request.body
    const mapType = ctx.query.search.mapType || ''

    if (mapType === CONSTANT.MAP3D && body.point3D.mid === '' && body.point3D.isouter) {
      const models = await modelService.findByQuery({ oid: CONSTANT.PATROLMODEL, default: true })
      if (_.isEmpty(models)) {
        ctx.throw(500, { code: 2001, message: '请添加巡更模型!' })
      }
      body.point3D.mid = _.get(models, '[0]._id', '').toString()
    }
    const result = await PatrolPoint.findByIdAndUpdate(id, body)
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      ctx.status = 200
      ctx.body = ''
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 删除巡更点位
module.exports.removePoint = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-删除巡更点位'))
  try {
    const id = ctx.params.id
    const result = await PatrolPoint.findByIdAndRemove(id)
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '找不到请求的服务资源' })
    } else {
      postal.publish({ channel: 'patrol', topic: 'array.update', data: [id] })
      ctx.status = 200
      ctx.body = ''
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 创建巡更点位
module.exports.createPointer = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-创建巡更点位'))
  try {
    const body = ctx.request.body
    const result = await PatrolPoint.create(body)
    if (_.isNull(result)) {
      ctx.throw(500, { code: 2001, message: '请求失败' })
    } else {
      ctx.status = 201
      ctx.headers['location'] = ctx.url + result._id
      ctx.body = [result._id]
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}
// 清除巡更点位地图坐标
module.exports.cleanPoint = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-清除巡更点位地图坐标'))
  try {
    const id = ctx.params.id
    const setObject = ctx.query.search.mapType === CONSTANT.MAP3D ? { point3D: '' } : { point: '' }
    await PatrolPoint.update({ _id: id }, { $unset: setObject }).exec()
    ctx.status = 200
    ctx.body = ''
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 批量删除点位
module.exports.batchrmPoint = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-批量删除点位'))
  try {
    let ids = ctx.request.headers['x-bsc-ids']
    ids = ids.split(',')
    if (_.isEmpty(ids)) {
      ctx.throw(500, { code: 2001, message: '请选择要删除的数据' })
    }
    await PatrolPoint.remove({ _id: { $in: ids } })
    postal.publish({ channel: 'patrol', topic: 'array.update', data: ids })
    ctx.status = 200
    ctx.body = ''
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 批量所有点位坐标
module.exports.removeAllPoint = data => {
  try {
    const setObject = data.mapType === CONSTANT.MAP3D ? { point3D: '' } : { point: '' }
    PatrolPoint.update({ point: { $exists: true } }, { $unset: setObject }, { multi: true }).exec()
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 批量删除巡更点位的坐标
module.exports.removePointByID = data => {
  try {
    if (data.mapType === CONSTANT.MAP3D) {
      PatrolPoint.update(
        { $or: [{ 'point3D.bid': data.id }, { 'point3D.sid': data.id }] },
        { $unset: { point3D: '' } },
        { multi: true }
      ).exec()
    } else {
      PatrolPoint.update(
        { $or: [{ 'point.bid': data.id }, { 'point.sid': data.id }] },
        { $unset: { point: '' } },
        { multi: true }
      ).exec()
    }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 统计点位的巡更次数
// module.exports.signleStatistic = async(ctx, next) => {
//   ctx.set('loginfo', encodeURI('单兵管理-统计点位的巡更次数'))
//   try {
//     const date = Number(moment(moment().format('YYYYMMDD')).format('X'))
//     const id = ctx.params.id || ''
//     if (id === '') {
//       ctx.throw(500, { code: 2001, message: '巡更点位不存在' })
//     }
//     const count = await PatrolRecord.countDocuments({
//       date: date,
//       points: { $elemMatch: { pointId: id, status: { $ne: 5 } } }
//     })
//     ctx.status = 200
//     ctx.body = { pratrol: count }
//   } catch (err) {
//     handleSysException(err, 2002)
//   }
// }

// // 统计指定组织下点位的巡更次数
module.exports.statistic = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-统计指定组织下点位的巡更次数'))
  try {
    const date = moment(moment().format('YYYYMMDD')).format('X')
    const orgid = ctx.query.search.orgid || ''
    const mapid = ctx.query.search.mapid || ''
    const mapType = ctx.query.search.mapType || ''
    let query = {}
    if (mapType !== CONSTANT.MAP3D) {
      if (mapid === '') {
        ctx.throw(500, { code: 2001, message: 'mapid必须输入' })
      }
      query = { 'point.mapid': mapid }
    } else {
      query.point3D = { $exists: true }
    }
    let org = []
    if (_.isEqual(orgid, '')) {
      org = await Org.find({ type: CONSTANT.POINT }, 'name').lean()
      org = org.map(item => item._id.toString())
    } else {
      org = await Org.find({ pid: orgid }, 'name').lean()
      org = org.map(item => item._id.toString())
      org.push(orgid)
    }
    query.affiliation = { $in: org }
    const record = []
    const points = await PatrolPoint.find(query, '-__v -updatedAt -createdAt').lean()
    const pointIds = points.map(item => item._id.toString())
    const records = await PatrolRecord.find({
      date: date,
      points: { $elemMatch: { pointId: { $in: pointIds } } }
    }).lean()
    for (const point of points) {
      // const info = { name: point.devName, device: point.devId, charger: point.charger, phone: point.phone, pratrol: 0, alarm: 0, fix: 0 }
      point.warranty = point.alarm = point.finished = 0
      for (const record of records) {
        const target = _.find(record.points, { pointId: point._id })
        if (target) {
          if (target.status === CONSTANT.UNPATROL) {
            break
          } else if (target.status === CONSTANT.TIMEOUTWARANTY || target.status === CONSTANT.ONTIMEWARANTY) {
            point.warranty++
          } else if (target.status === CONSTANT.TIMEOUTALARM || target.status === CONSTANT.ONTIMEALARM) {
            point.alarm++
          }
          point.finished++
        }
      }
      record.push(point)
    }
    ctx.status = 200
    ctx.body = record
  } catch (err) {
    handleSysException(err, 2002)
  }
}

module.exports.signleStatistic = async (ctx, next) => {
  ctx.set('loginfo', encodeURI('单兵管理-统计点位的巡更次数'))
  try {
    const date = Number(moment(moment().format('YYYYMMDD')).format('X'))
    const id = ctx.params.id || ''
    if (id === '') {
      ctx.throw(500, { code: 2001, message: '巡更点位不存在' })
    }
    const count = await PatrolRecord.countDocuments({
      date: date,
      points: { $elemMatch: { pointId: id, status: { $ne: 5 } } }
    })
    ctx.status = 200
    ctx.body = { pratrol: count }
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 统计指定组织下点位的巡更次数
// module.exports.statistic = async (ctx, next) => {
//   ctx.set('loginfo', encodeURI('单兵管理-统计指定组织下点位的巡更次数'))
//   try {
//     const date = moment(moment().format('YYYYMMDD')).format('X')
//     const id = ctx.query.search.id || ''
//     const point = await PatrolPoint.findById(id, '-__v -updatedAt -createdAt').lean()
//     const records = await PatrolRecord.find({
//       date: date,
//       points: { $elemMatch: { pointId: id } }
//     }).lean()
//     const statics = { alarm: 0, warranty: 0, timeout: 0 }
//     for (const record of records) {
//       // const result = _.find(record.points, { pointId: id })
//       const result = record.points.find(item => item.pointId.toString() === id)
//       if (!_.isEmpty(result)) {
//         if (_.isEmpty(result.arrivalTime)) {
//           continue
//         }
//         switch (result.status) {
//           case 1:
//           case 8:
//             statics.alarm++
//             break
//           case 2:
//           case 9:
//             statics.warranty++
//             break
//           case 6:
//             statics.timeout++
//             statics.alarm++
//             break
//           case 7:
//             statics.timeout++
//             statics.warranty++
//             break
//           case 4:
//             statics.timeout++
//         }
//       }
//     }
//     ctx.status = 200
//     ctx.body = Object.assign(statics, point)
//   } catch (err) {
//     handleSysException(err, 2002)
//   }
// }

// 生成设备唯一标识
module.exports.getUniqId = async (ctx, next) => {
  try {
    ctx.status = 200
    ctx.body = moment().format('x') + parseInt(100 * Math.random())
  } catch (err) {
    handleSysException(err, 2002)
  }
}

// 检查用户名称是否唯一
module.exports.validUser = async (ctx, next) => {
  try {
    const username = ctx.query.search.username || ''
    if (_.isEmpty(username)) {
      ctx.throw(500, { code: 2001, message: '用户名参数不能为空' })
    }
    const result = await Security.find({ username }).lean()
    if (_.isEmpty(result)) {
      ctx.body = { exist: false }
    } else {
      ctx.body = { exist: true }
    }
    ctx.status = 200
  } catch (err) {
    handleSysException(err, 2002)
  }
}

/**
 * 查询离报警点位最近的巡更人员
 * @param {*} ctx
 */
module.exports.computedNearbyUser = async ctx => {
  try {
    const id = ctx.query.search.id || ''
    const type = ctx.query.search.mapType || ''
    if (_.isEmpty(id)) {
      ctx.throw(500, { code: 2001, message: '参数不合法' })
    }
    const objPath = type === CONSTANT.MAP3D ? 'point3D.geo' : 'point.geo'
    const [alarmPoint, user] = await Promise.all([
      sentryService.pointFindById(id),
      sentryService.securityFind({ devStaus: 'online' }, 'realname phone photo geo')
    ])
    if (_.isEmpty(_.get(alarmPoint, objPath))) {
      ctx.throw(500, { code: 2001, message: '报警点位在地图上找不到' })
    }
    const point = _.get(alarmPoint, objPath)
      .split(',')
      .map(item => Number(item))
    const spacePoint = helpers.point(point)
    const spaceProjection = projection.toMercator(spacePoint)
    user.forEach(item => {
      if (_.isEmpty(item.geo)) {
        return
      }
      const userPoint = helpers.point([item.geo.lon, item.geo.lat])
      const userProjection = projection.toMercator(userPoint)
      const distance = pointDistance(spaceProjection.geometry.coordinates, userProjection.geometry.coordinates)
      item.distance = distance
    })
    user.sort((a, b) => {
      return b.distance - a.distance
    })
    ctx.body = user
  } catch (error) {
    handleSysException(error, 2002)
  }
}

function pointDistance (point1, point2) {
  const [x1, y1] = [...point1]
  const [x2, y2] = [...point2]
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}
