/**
 * 录像计划模型
 * @time:207-6-17
 * @author:hansen
 */

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recordSchema = new Schema(
  {
    // 是否启用计划
    enable: {
      type: String
    },
    // 录像计划类型（定时录像|事件录像）
    takeType: {
      type: String,
      enum: ['timeVideo', 'eventVideo']
    },
    // 录像码流
    streamType: {
      type: String,
      enum: ['main', 'sub1', 'sub2']
    },
    // 计划模板Id
    planTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'PlanTemplate'
    },
    // 对应的通道资源Id
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource'
    },
    RateStatus: {
      type: Number, // 在线率是否异常 1: 正常 2：非正常 3：无记录
      default: 3
    }
  },
  { timestamps: true }
)

mongoose.model('Record', recordSchema)
