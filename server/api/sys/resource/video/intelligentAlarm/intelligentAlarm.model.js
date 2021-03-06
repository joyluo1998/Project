/*
 * 智能报警模型
 * @Author: chenkaibo
 * @Date: 2018-06-06 14:53:30
 * @Last Modified by: chenkaibo
 * @Last Modified time: 2018-07-23 15:53:04
 */

'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IntelligentAlarmSchema = new Schema({
  rid: { // 所属视频通道
    type: Schema.Types.ObjectId,
    ref: 'Resource'
  },
  name: { // 名称
    type: String
  },
  type: [
    { // 报警具体类型
      type: String,
      enum: ['perimeter', 'tripwire', 'missingObject', 'leftObject', 'loitering', 'retrogradeDetection', 'lingerDetection', 'doubleCordon', 'blackList', 'whiteList', 'redList', 'dispatch', 'dispatchHuman', 'dispatchVehicle', 'areaInvade', 'fastMove', 'parkDetect', 'humanAssemble', 'objectMove']
      // 0：周界保护 1：绊线  2：物品丢失  3：物品遗留  4：非法停留  5：逆行检测  6：徘徊检测  7：双警戒线
      // 8：黑名单  9：白名单 10:红名单 11：布控, 12:布控人员 13 布控车辆 14 区域入侵 15 快速移动 16 停车检测 17 人员聚集 18 物品搬移
    }
  ],
  chan: { // 通道号
    type: Number
  },
  alarmtemplate: { // 布撤防时间
    type: Schema.Types.ObjectId,
    ref: 'PlanTemplate'
  },
  level: { // 级别
    type: Number
  },
  alarmtype: {
    type: Schema.Types.ObjectId,
    ref: 'alarmType'
  },
  maxdelaytime: { // 最大延迟时间
    type: Number,
    default: 300
  },
  minintervaltime: { // 最小间隔时间
    type: Number,
    default: 300
  },
  mapsign: { // 地图标识
    signflag: {
      type: Boolean
    },
    signtype: {
      type: Number,
      enum: [0, 1, 2] // 0:图标,1:线,2:区域
    },
    signvalue: {
      type: String
    }
  },
  alarmaffirm: { // 报警确认
    affirmflag: {
      type: Boolean
    },
    autoaffirm: {
      status: {
        type: Boolean
      },
      intervaltime: {
        type: Number // 时间间隔
      }
    },
    handaffirm: {
      status: {
        type: Boolean
      }
    }
  }
})

mongoose.model('IntelligentAlarm', IntelligentAlarmSchema)
