/*
 * @Author: chenkaibo
 * @Date: 2018-10-22 19:13:57
 * @Last Modified by: linhang
 * @Last Modified time: 2018-12-12 16:27:04
 */
'use strict'

const { handleSysException, sleep } = require('../../../common/tools')
const AlarmService = require('./alarm.service')
const alarmService = new AlarmService()

// 获取报警类型
exports.getAlarmTypes = ctx => {
  ctx.set('loginfo', encodeURI('资源管理-获取报警类型'))
  ctx.body = {
    alarmInput: [{ label: '报警输入', value: 'alarmIn' }],
    alarmOutput: [{ label: '报警输出', value: 'alarmOut' }],
    alarmHelp: [{ label: '报警求助', value: 'alarmHelp' }],
    // 0：sd卡故障 1：sd卡满  2：网络断开  3：ip冲突  4：时间异常  5：非法网络访问
    // 'hardDiskFailure', 'hardDiskFull', 'networkDown', 'ipConflict', 'timeAbnormal', 'illegalNetworkAccess'
    deviceAlarm: [
      { label: 'sd卡故障', value: 'hardDiskFailure' },
      { label: 'sd卡满', value: 'hardDiskFull' },
      {
        label: '网络断开',
        value: 'networkDown'
      },
      { label: 'ip冲突', value: 'ipConflict' },
      { label: '时间异常', value: 'timeAbnormal' },
      {
        label: '非法网络访问',
        value: 'illegalNetworkAccess'
      }
    ],
    // '周界保护', '绊线', '物品丢失', '物品遗留', '非法停留', '逆行检测', '徘徊检测', '双警检测', '黑名单', '白名单', '布控'
    // 'perimeter', 'tripwire', 'missingObject', 'leftObject', 'loitering', 'retrogradeDetection', 'LingerDetection', 'doubleCordon', 'blackList', 'whiteList', 'dispatch'
    intelligentAlarm: [
      { label: '周界保护', value: 'perimeter' },
      { label: '绊线', value: 'tripwire' },
      { label: '物品丢失', value: 'missingObject' },
      {
        label: '物品遗留',
        value: 'leftObject'
      },
      { label: '非法停留', value: 'loitering' },
      { label: '逆行检测', value: 'retrogradeDetection' },
      {
        label: '徘徊检测',
        value: 'lingerDetection'
      },
      { label: '双警检测', value: 'doubleCordon' },
      { label: '黑名单', value: 'blackList' },
      {
        label: '白名单',
        value: 'whiteList'
      },
      { label: '布控', value: 'dispatch' },
      { label: '区域入侵', value: 'areaInvade' },
      { label: '快速移动', value: 'fastMove' },
      { label: '停车检测', value: 'parkDetect' },
      { label: '人员聚集', value: 'humanAssemble' },
      { label: '物品搬移', value: 'objectMove' }
    ],
    // '移动侦测', '视频遮挡', '镜头移位', '清晰度异常', '亮度异常', '噪声检测', '偏色检测', '信号丢失', '画面冻结'
    // 'alarmMoveSense', 'videoMask', 'sceneSwitch', 'definitionAbnormal', 'brightnessAbnormal', 'noise', 'colorCast', 'signalLoss', 'screenFreeze'
    monitoryPointAlarm: [
      { label: '移动侦测', value: 'alarmMoveSense' },
      { label: '视频遮挡', value: 'videoMask' },
      { label: '镜头移位', value: 'sceneSwitch' },
      {
        label: '清晰度异常',
        value: 'definitionAbnormal'
      },
      { label: '亮度异常', value: 'brightnessAbnormal' },
      { label: '噪声检测', value: 'noise' },
      {
        label: '偏色检测',
        value: 'colorCast'
      },
      { label: '信号丢失', value: 'signalLoss' },
      { label: '画面冻结', value: 'screenFreeze' }
    ],
    fireAlarm: [{ label: '消防报警', value: 'fireAlarm' }, { label: '消防故障', value: 'fireFailure' }],
    focusAttention: [{ label: '重点关注', value: 'focusAttention' }],
    violation: [{ label: '违章逆行', value: 'vioRetrograde' }, { label: '违章停车', value: 'vioPark' }, { label: '违章左转', value: 'vioTurnLeft' }, { label: '违章右转', value: 'vioTurnRight' }]
  }
}
// 布防
exports.arm = async ctx => {
  try {
    await alarmService.arm(ctx)
    ctx.status = 200
  } catch (error) {
    handleSysException(error)
  }
}
// 撤防
exports.disarm = async ctx => {
  try {
    await alarmService.disarm(ctx)
    ctx.status = 200
  } catch (error) {
    handleSysException(error)
  }
}
// 报警清除
exports.alarmClean = async ctx => {
  try {
    await alarmService.alarmClean(ctx)
    ctx.status = 200
  } catch (error) {
    handleSysException(error)
  }
}
// 旁路
exports.bypass = async ctx => {
  try {
    await alarmService.bypass(ctx)
    ctx.status = 200
  } catch (error) {
    handleSysException(error)
  }
}
// 撤旁
exports.pass = async ctx => {
  try {
    await alarmService.pass(ctx)
    ctx.status = 200
  } catch (error) {
    handleSysException(error)
  }
}

// 根据设备获取报警资源
exports.getResourceByEid = async ctx => {
  try {
    const ALARM_IN_TYPE = 9
    const reses = await alarmService.findResourceByQuery({ eid: ctx.query.eid, type: ALARM_IN_TYPE })
    const result = await alarmService.getResAlarmStatus(ctx)
    const resp = await alarmService.mergeAlarmStatus(reses, result)
    ctx.status = 200
    ctx.body = resp
  } catch (error) {
    handleSysException(error)
  }
}

// 获取单个设备的报警状态
exports.getDeviceStatus = async ctx => {
  try {
    await sleep(3000)
    const result = await alarmService.getDevAlarmStatus(ctx)
    ctx.body = result ? result.devStatus : ''
  } catch (error) {
    handleSysException(error)
  }
}
// 获取单个资源的报警状态
exports.getResourceStatusByRid = async ctx => {
  try {
    const res = await alarmService.findResourceById(ctx.params.id, 'name type status chan eid')
    ctx.query.eid = res.eid
    const result = await alarmService.getResAlarmStatus(ctx)
    let status = ''
    result &&
      result.length &&
      result.forEach(item => {
        if (item.channel + '' === res.chan + '') {
          status = item.status
        }
      })
    ctx.status = 200
    ctx.body = status
  } catch (error) {
    handleSysException(error)
  }
}
// 根据资源获取联动视频
exports.getActionVideoByRes = async ctx => {
  try {
    const results = await alarmService.getActionVideoByRes(ctx.query.rid)
    for (var res of results) {
      res.resource = await alarmService.findResourceById(res.resource, 'chan name stream ip port nodeId gbPlaDevIp gbPlaDevPort gbDevId gbParentDevId gbPlaNvrId shareServer')
    }
    ctx.status = 200
    ctx.body = results
  } catch (error) {
    handleSysException(error)
  }
}
