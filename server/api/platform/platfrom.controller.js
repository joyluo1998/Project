/*
 * @Author: zhangminbo
 * @Date: 2018-08-15 13:57:32
 * @Last Modified by: hansen.liuhao
 * @Last Modified time: 2018-12-21 15:20:21
 */
'use strict'

const mongoose = require('mongoose')
const PlatformServer = mongoose.model('PlatformServer')
const Device = mongoose.model('Device')
const Org = mongoose.model('Org')
const Resource = mongoose.model('Resource')
const OrgRes = mongoose.model('OrgRes')
const _ = require('lodash')
const util = require('../../common/protobuf.util')
const tool = require('../../common/tools')
const command = require('../../common/command')
const numTool = require('./generateNum')
const CONSTANT = {
  ORG: 'org',
  RES: 'res',
  SERVICE: 'Service',
  IPC: 'ipc',
  ALARMHOST: 'alarmHost',
  VIDEO: 0,
  ALARM: 7
}

exports.getServer = async ctx => {
  const type = ctx.query.type
  try {
    ctx.body = await PlatformServer.find({ type: type }).exec()
  } catch (error) {
    tool.handleSysException(error)
  }
}
exports.getServerById = async ctx => {
  try {
    ctx.body = await PlatformServer.findById(ctx.params.id)
  } catch (error) {
    tool.handleSysException(error)
  }
}

exports.postServer = async ctx => {
  try {
    ctx.body = await PlatformServer.create(ctx.request.body)
  } catch (error) {
    tool.handleSysException(error)
  }
}

exports.delServer = async ctx => {
  try {
    await Promise([
      PlatformServer.findOneAndDelete({ _id: ctx.params.id }),
      Resource.deleteMany({ shareServer: ctx.params.id }),
      Org.deleteMany({ shareServer: ctx.params.id }),
      OrgRes.deleteMany({ shareServer: ctx.params.id }),
      Device.deleteMany({ shareServer: ctx.params.id })
    ])
    ctx.status = 200
  } catch (error) {
    tool.handleSysException(error)
  }
}
exports.putServer = async ctx => {
  try {
    const putData = ctx.request.body
    // sharedata存在,与旧数据合并
    if (putData.shareData) {
      const ops = await PlatformServer.findById(ctx.params.id, 'shareData')
      putData.shareData = Object.assign(JSON.parse(JSON.stringify(ops.shareData)), putData.shareData)
    }
    const ps = await PlatformServer.findOneAndUpdate({ _id: ctx.params.id }, putData)
    // 若平台服务Id 发生改变 则更新所有跟机构的gbParentDevId
    if (ps.serverId !== putData.serverId && putData.type === 'loc') {
      await Org.findOneAndUpdate({ isroot: true, type: 0 }, { gbParentDevId: putData.serverId }) // 修改服务器Id时
    }
    ctx.status = 200
  } catch (error) {
    tool.handleSysException(error)
  }
}

// /**
//  *  获取服务器 已分享的资源
//  * @param {*} ctx
//  */
// exports.getShareData = async ctx => {
//   const id = ctx.params.id
//   const type = ctx.params.type + 'res'
//   const selectObj = {
//     video: n => n === 0, // 视频资源
//     alarm: n => n === 9  // 报警输入资源
//   }
//   const server = await PlatformServer.findById(id).populate({ path: 'shareData.res', select: 'type _id' }).exec()
//   const result = []
//   server.shareData.res.forEach(n => {
//     selectObj[type](n.type) && result.push(n._id)
//   })
//   ctx.body = result
// }

exports.getShareTree = async ctx => {
  try {
    const type = ctx.params.type
    const server = await PlatformServer.findById(ctx.params.shareServer).exec()
    const payload = { cmdBase: { devIp: server.ip, devPort: server.port } }
    const sysCatalogCfg = { id: server.serverId }
    const basePro = util.baseProto('SysCatalogMA2DA')
    const SysCatalogCfg = util.getProtoMsg(basePro, 'SysCatalogCfg')
    const structPro = util.getProtoMsg(basePro, 'CommandGeneric')
    const buf = util.encode(SysCatalogCfg, sysCatalogCfg)
    const data = _.merge(payload, { cmdContent: buf })
    const bufReq = util.encode(structPro, data)
    const result = await util.tcp(bufReq, command.VMR_COMMAND_MA2DA_GB_GET_CATALOG)
    const SysCatalogCfgPrm = util.getProtoMsg(basePro, 'SysCatalogCfgPrm')
    var resPbData = SysCatalogCfgPrm.decode(result.message)
    var resJsonData = SysCatalogCfgPrm.toObject(resPbData, {
      enums: String,
      longs: String,
      bytes: String,
      defaults: true,
      arrays: true,
      objects: true,
      oneofs: true
    })
    resJsonData.TreeNodeCfgPrmArr.forEach(n => {
      n.nodeId === n.parentId && delete n.parentId
      n.name = Buffer.from(n.name.toString(), 'base64').toString()
      if (n.nodeTypeEnum === 'Ipc') {
        n.eid = ''
        n.monitortype = 0
      }
    })
    const filter = {
      video: n => ['Ipc', 'Nvr', 'Service'].includes(n),
      alarm: n => ['AlarmInput', 'Service'].includes(n)
    }
    let treeData = resJsonData.TreeNodeCfgPrmArr.filter(n => filter[type](n.nodeTypeEnum))
    treeData = treeData.map(item => {
      item._id = item.nodeId
      item.pid = item.parentId
      return item
    })
    // ctx.body = tool.transData2Tree(treeData, 'nodeId', 'parentId')
    ctx.body = tool.transData2Tree(treeData, '_id', 'pid')
  } catch (error) {
    tool.handleSysException(error)
  }
}

exports.catalog = async ctx => {
  const { gbPlatId: serverId, gbIp: ip, gbPort: port } = ctx.request.body
  const [locServer, downServers, upServers, orgRoot] = await Promise.all([
    PlatformServer.findOne({ type: 'loc' }).lean(),
    PlatformServer.find({ type: 'down' }).lean(),
    PlatformServer.find({ type: 'up', serverId, ip, port })
      .populate([
        {
          path: 'shareData.videoOrg'
        },
        {
          path: 'shareData.alarmOrg'
        },
        {
          path: 'shareData.videoRes',
          populate: {
            path: 'eid',
            select: 'manufacturer _id model'
          }
        },
        {
          path: 'shareData.alarmRes',
          populate: {
            path: 'eid',
            select: 'manufacturer _id model'
          }
        }
      ])
      .lean(),
    Org.findOne({ type: 0, isroot: true }, 'gbDevId').lean()
  ])
  // 下联服务器id/服务器id字典
  const downServerDict = {}
  downServers.forEach(n => {
    downServerDict[n._id] = n
  })
  let orgs = []
  let res = []
  const org2ServerDict = {}
  const res2ServerDict = {}
  // id2GenerateNum
  upServers.forEach(n => {
    // 视频机构
    if (n.shareData.videoOrg) {
      n.shareData.videoOrg.forEach(m => {
        org2ServerDict[m._id] = n
      })
      orgs = orgs.concat(n.shareData.videoOrg)
    }
    // 报警机构
    if (n.shareData.alarmOrg) {
      n.shareData.alarmOrg.forEach(m => {
        org2ServerDict[m._id] = n
      })
      orgs = orgs.concat(n.shareData.alarmOrg)
    }
    // 视频资源
    if (n.shareData.videoRes) {
      n.shareData.videoRes.forEach(m => {
        res2ServerDict[m._id] = n
      })
      res = res.concat(n.shareData.videoRes)
    }
    // 报警资源
    if (n.shareData.alarmRes) {
      n.shareData.alarmRes.forEach(m => {
        res2ServerDict[m._id] = n
      })
      res = res.concat(n.shareData.alarmRes)
    }
  })
  res = objArrUnique(res)
  orgs = objArrUnique(orgs)
  // 合并全部机构和资源
  const allTree = res.concat(orgs)

  // 返回对象
  const obj = {
    cmdType: 'Catalog',
    sumNum: allTree.length + 1, // 包含本级服务器节点
    nodeInfo: []
  }
  // 机构
  orgs.forEach(n => {
    if (n.gbParentDevId === orgRoot.gbDevId) {
      n.gbParentDevId = locServer.serverId
    }
    obj.nodeInfo.push(generatePushData(n, org2ServerDict, allTree, locServer, downServerDict, 'block'))
  })

  // 资源
  res.forEach(n => {
    if (n.gbParentDevId === orgRoot.gbDevId) {
      n.gbParentDevId = locServer.serverId
    }
    obj.nodeInfo.push(
      generatePushData(n, res2ServerDict, allTree, locServer, downServerDict, n.type === 0 ? 'video' : 'alarm')
    )
  })

  // orgs
  // 添加本级服务器节点
  const locServerData = generatePushData(
    {
      status: true,
      name: locServer.name,
      _id: 'locServerId',
      manufacturer: locServer.manufacturer, // 厂商
      model: locServer.model || '', // 设备型号
      isroot: true,
      deviceID: locServer.serverId,
      gbParentDevId: locServer.serverId
    },
    { locServerId: { SIP: locServer.SIP } },
    allTree,
    locServer,
    downServerDict,
    'unknown'
  )
  obj.nodeInfo.unshift(locServerData)
  ctx.body = obj
}

/**
 * 生成推送数据
 * @param {*} n 资源或机构数据本身
 * @param {*} dict // 资源或机构ID对应服务器对象
 * @param {*} allTree  // 所有树数据(机构 + 资源)
 * @param {*} locServer // 本地服务器对象
 */
const generatePushData = (n, dict, allTree, locServer, downServerDict, block) => {
  return {
    name: n.name,
    civilCode: n.nodeId ? dict[n._id].SIP : locServer.SIP,
    owner: n.nodeId ? dict[n._id].SIP : locServer.SIP,
    status: n.status ? 'ON' : 'OFF',
    parental: 0,
    manufacturer: n.eid ? n.eid.manufacturer : '', // 厂商
    model: n.eid ? n.eid.model || '' : '', // 设备型号
    block: block, // 警区--可选
    address: getTreeName(allTree, n.gbDevId), // 安装地址
    safetyWay: 0, // 信令安全模式--可选
    registerWay: 1, // 注册方式1： 2： 3：
    secrecy: 0, // 保密属性
    deviceID: n.deviceID && n.deviceID.length === 20 ? n.deviceID : locServer.SIP + n.gbDevId,
    locServerId: n.nodeId ? n.shareServer : locServer._id, // 分享服务器Id
    parentID: n.gbParentDevId && n.gbParentDevId.length === 20 ? n.gbParentDevId : locServer.SIP + n.gbParentDevId,
    // ParentID: n.isroot ? n.gbParentDevId : locServer.SIP + n.gbParentDevId,
    platform: n.nodeId ? downServerDict[n.shareServer].serverId : locServer.serverId, // 如果这个设备是级联平台的就是级联平台的id 不是就是本级平台的id
    platIp: n.nodeId ? downServerDict[n.shareServer].ip : locServer.ip, // 当前设备或者机构的平台的ip 如果是级平台的就是级联平台的ip
    platPort: n.nodeId ? downServerDict[n.shareServer].port : locServer.port, // 这个设备的级联平台的端口 不是级联上的就是本级的端口
    gDeviceIp: n.ip || '', // 设备
    gDevicePort: n.port || 0,
    gDeviceChannel: n.chan || 0,
    gDeviceStream: n.stream || '',
    gNodeId: n.nodeId || ''
  }
}

/**
 *  对象数组根据_id去除重复
 * @param {Array} data  数据源
 */
const objArrUnique = data => {
  const t = {}
  const tmp = []
  data.forEach(n => {
    if (!t[n._id]) {
      t[n._id] = true
      tmp.push(n)
    }
  })
  return tmp
}

/**
 * 获取安装地址
 * @param {*} data 树数据
 * @param {*} gbDevId 当前国标设备ID
 * @param {*} arr 衍生值
 */
const getTreeName = (data, gbDevId, arr = []) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].gbDevId === gbDevId) {
      arr.unshift(data[i].name)
      if (data[i].gbParentDevId) {
        getTreeName(data, data[i].gbParentDevId, arr)
        break
      }
    }
  }
  return arr.join('-')
}

exports.putShareTree = async ctx => {
  const orgId = ctx.params.orgId
  const shareServer = ctx.params.shareServer

  let shareType = ctx.params.shareType // Ipc/Nvr/AlarmInput/AlarmOutput
  shareType = shareType === 'video' ? 'ipc' : 'alarm'
  const putData = ctx.request.body
  const server = await PlatformServer.findById(shareServer).exec()
  const targetOrg = await Org.findById(orgId)
  const orgType = targetOrg.type // // 视频机构分类
  const targetRootOrg = await Org.findOne({ type: orgType, isroot: true }).exec()
  const opt = {
    orgType,
    shareServer,
    shareType,
    gbPlaDevIp: server.ip, // 国际设备IP 或者平台IP
    gbPlaDevPort: server.port // 国际设备或者平台的PORT
  }

  // 获取节点id字典 数据添加ID
  const nodeIdObjectIdDict = generateObjectId(putData)

  // 获取国标机构数据
  const orgData = putData.filter(n => n.nodeTypeEnum === 'Service')
  // 获取国标资源数据
  const resData = putData.filter(n => n.nodeTypeEnum.toLowerCase() === shareType)

  // 删除对比缺失数据并获取最新数据
  const { curOrg, curRes } = await diffRemoveAndGetCur(orgData, resData, shareServer, shareType)
  const data = await syncData(curOrg, curRes, putData, nodeIdObjectIdDict, orgId, opt, targetRootOrg, targetOrg)
  ctx.body = data
  // ctx.body = tool.transData2Tree(data, '_id', 'pid')
}

const syncData = async (curOrg, curRes, putData, nodeIdObjectIdDict, orgId, opt, targetRootOrg, targetOrg) => {
  const curDataAll = curOrg.concat(curRes) // 资源与设备nodeId 相同  这里按照资源计算
  // 赋值的新树(半成品的树)
  const cpNewTree = []
  putData.forEach(n => {
    delete n.children // 防止携带多余children属性
    // const filterOrgData = JSON.parse(JSON.stringify(curDataAll.filter(m => n.nodeId === m.nodeId)))
    const rawNode = curDataAll.find(m => n.nodeId === m.nodeId)
    const existNode = rawNode ? JSON.parse(JSON.stringify(rawNode)) : ''
    if (existNode) {
      // if (filterOrgData.length) {
      // 已存在数据(合并)
      const tmp = Object.assign(existNode, n)
      tmp.type = opt.orgType
      tmp.ip = n.devIp
      tmp.status = n.devStatus
      tmp.port = n.devPort
      tmp.nodeType = n.nodeTypeEnum === CONSTANT.SERVICE ? CONSTANT.ORG : CONSTANT.RES
      cpNewTree.push(tmp)
    } else {
      // 未存在数据(添加)
      n._id = nodeIdObjectIdDict[n.nodeId]
      n.type = opt.orgType
      n.shareServer = opt.shareServer
      n.shareType = opt.shareType
      n.ip = n.devIp
      n.status = n.devStatus
      n.port = n.devPort
      n.nodeType = n.nodeTypeEnum === CONSTANT.SERVICE ? CONSTANT.ORG : CONSTANT.RES
      n = Object.assign(n, opt)
      cpNewTree.push(n)
    }
  })

  // nodeID对应的ObjectIs (映射的新树)
  const nodeIdObjectDict = {}
  cpNewTree.forEach(n => {
    nodeIdObjectDict[n.nodeId] = n._id
  })
  cpNewTree.forEach(n => {
    n.pid = nodeIdObjectDict[n.parentId] || orgId
  })

  // 分离组织与资源
  const { orgDatas, resDatas } = getResAndOrgData(cpNewTree)

  // 生成组织资源关系数据
  const orgResDatas = getOrgResDatas(resDatas, opt.shareServer, targetRootOrg)

  // 生成下联资源对应的虚拟设备数据
  const { devDatas, devNodeIdDict } = getDevDatas(resDatas, opt.shareServer, opt.shareType)
  // const { orgDevDict, devDatas, devNodeIdDict } = getDevDatas(resDatas, opt.shareServer)

  // 刷新资源、虚拟设备、资源 之间关系
  // freshData(orgDatas, resDatas, orgDevDict, devNodeIdDict)
  // 关联待生成的虚拟设备与下联资源
  resDatas.forEach(n => (n.eid = devNodeIdDict[n.nodeId].toString()))

  // 分享数据添加国标 gbParentDevId/gbDevId (推送使用字段)
  await addDevIDAndParentID(resDatas, opt.shareType, orgResDatas, orgDatas, targetOrg.gbDevId)

  // 更新虚拟设备
  await updateData(devDatas, Device)

  // 更新机构
  await updateData(orgDatas, Org)

  // 更新资源
  await updateData(resDatas, Resource)

  // 更新机构资源中间表
  await updateData(orgResDatas, OrgRes)

  return resDatas
}

/**
 * 分享数据添加国标 gbParentDevId/gbDevId (推送使用字段)
 * @param {*} resDatas  资源数据
 * @param {*} shareType  分享类型(ipc/alarmIn)
 * @param {*} orgResDatas 机构资源数据
 * @param {*} orgDatas 机构数据
 */
const addDevIDAndParentID = async (resDatas, shareType, orgResDatas, orgDatas, targetGbDevId) => {
  const nums = await numTool.generateDevieId(shareType, resDatas.length)
  const orgNums = await numTool.generateDevieId('org', orgDatas.length)
  // 创建机构字典
  const orgDict = {}
  orgDatas.forEach((n, i) => {
    orgDict[n._id + ''] = n.gbDevId || orgNums[i]
  })
  // 映射过来的树不存在根节点 所以不会添加国标服务器Id
  orgDatas.forEach(n => {
    n.gbParentDevId = orgDict[n.pid + ''] || targetGbDevId
    n.gbDevId = orgDict[n._id + '']
  })
  // 创建资源字典
  const resDict = {}
  resDatas.forEach((n, i) => {
    resDict[n._id] = n.gbDevId || nums[i]
  })
  // 创建资源机构字典(用于添加机构父节点)
  const resOrgDict = {}
  orgResDatas.forEach(n => {
    resOrgDict[n.resource + ''] = orgDict[n.org]
  })
  // 资源数据devID/parentID 赋值
  resDatas.forEach(n => {
    n.gbParentDevId = resOrgDict[n._id + ''] || targetGbDevId
    n.gbDevId = resDict[n._id + '']
  })
}

/**
 * 更新数据库数据
 * @param {*} data 更新数据
 * @param {*} model 更新模型
 */
const updateData = async (data, model) => {
  const promise = []
  data.forEach(n => {
    if (n._id) {
      promise.push(model.findByIdAndUpdate(n._id, n, { upsert: true }))
    } else {
      promise.push(model.create(n))
    }
  })
  await Promise.all(promise)
}

/**
 * 根据资源信息，生成对应的虚拟设备信息
 * @param {*} data 资源数据
 * @param {object} shareServer 下联的平台信息
 */
const getDevDatas = (data, shareServer, shareType) => {
  const devNodeIdDict = {}
  data.forEach(n => {
    devNodeIdDict[n.nodeId] = mongoose.Types.ObjectId() + ''
  })
  const devDatas = []
  // 组织虚拟设备数据
  data.forEach(n => {
    devDatas.push({
      _id: devNodeIdDict[n.nodeId],
      name: n.name,
      cport: n.devPort,
      dport: n.dataPort,
      status: n.devStatus,
      model: n.model,
      manufacturer: n.manufacturer,
      nodeId: n.nodeId,
      oid: n.pid,
      bigtype: 0,
      shareServer: shareServer,
      shareType: shareType
    })
  })
  return { devDatas, devNodeIdDict }
}
/**
 * 获取组织资源关系数据
 * @param {array} data 组织、资源混合数据
 * @param {object} shareServer 下联的平台信息
 * @param {object} targetRootOrg 本机平台根机构
 * @returns {array}
 */
const getOrgResDatas = (data, shareServer, targetRootOrg) => {
  return data.map(n => {
    return {
      org: n.pid,
      resource: n._id,
      rootorg: targetRootOrg._id,
      shareServer: shareServer
    }
  })
}
/**
 * 获取分离的组织、资源数据
 * @param {array} data 组织、资源混合数据
 * @returns {object}
 */
const getResAndOrgData = data => {
  const [orgDatas, resDatas] = [[], []]
  data.forEach(n => {
    if (n.nodeType === CONSTANT.ORG) {
      // 机构
      orgDatas.push(n)
    } else {
      // 资源
      resDatas.push(n)
    }
  })
  return { orgDatas, resDatas }
}

const generateObjectId = data => {
  const nodeIdObjectIdDict = {}
  data.forEach(n => {
    nodeIdObjectIdDict[`${n.nodeId}`] = mongoose.Types.ObjectId() + ''
  })
  return nodeIdObjectIdDict
}

/**
 * 删除本次没有映射的下联资源、组织、虚拟设备、组织资源关系。返回本次添加并且已经生成的组织、资源、虚拟设备
 * @param {*} orgData 国标机构数据
 * @param {*} resData 国标资源数据
 * @param {*} shareServer 平台服务器ID
 * @param {*} shareType 分享分类
 */
const diffRemoveAndGetCur = async (orgData, resData, shareServer, shareType) => {
  // 设备和资源的nodeId是一致的，所以这里只比较一次差异
  const [oldOrgs, oldRes] = await Promise.all([
    Org.find({ shareServer: shareServer, shareType: shareType }).lean(),
    Resource.find({ shareServer: shareServer, shareType: shareType }).lean(),
    Device.deleteMany({ shareServer: shareServer, shareType: shareType }),
    OrgRes.deleteMany({ shareServer: shareServer }) // 删除中间关系
  ])
  const removeOrgNodeIds = getDiffNodeIds(oldOrgs, orgData)
  const removeResNodeIds = getDiffNodeIds(oldRes, resData)
  if (removeOrgNodeIds.length) {
    await Org.deleteMany({ nodeId: { $in: removeOrgNodeIds } })
  }
  if (removeResNodeIds.length) {
    await Resource.deleteMany({ nodeId: { $in: removeResNodeIds } })
  }
  const curOrg = oldOrgs.filter(n => !removeOrgNodeIds.includes(n.nodeId.toString()))
  const curRes = oldRes.filter(n => !removeResNodeIds.includes(n.nodeId.toString()))
  // const curDev = oldDev.filter(n => !removeResNodeIds.includes(n.nodeId.toString()))
  return { curOrg, curRes }
}

/**
 * 获取不包含在新数据中的老数据
 * [A,B,C,D] , [A,B,E,F,G] ===> [C,D]
 * @param {*} oldData // 老数据
 * @param {*} newData // 新数据
 */
const getDiffNodeIds = (oldData, newData) => {
  const oldNodeIds = oldData.map(n => n.nodeId.toString())
  const newNodeIds = newData.map(n => n.nodeId.toString())
  return oldNodeIds.filter(n => !newNodeIds.includes(n))
}
