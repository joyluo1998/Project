/*
 * 网格模型
 * @Author: chenkaibo
 * @Date: 2018-06-06 14:20:31
 * @Last Modified by: chenkaibo
 * @Last Modified time: 2018-10-31 17:23:21
 */

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GridSchema = new Schema({
  name: { // 网格名称
    type: String,
    required: true,
    unique: true
  },
  mapId: { // 承载底图
    type: Schema.Types.ObjectId,
    ref: 'MapList'
  },
  sid: { // 楼层id
    type: Schema.Types.ObjectId,
    ref: 'Storey'
  },
  code: { // 网格编号
    type: String
  },
  charge: {
    type: String // 负责单位
  },
  desc: { // 简介
    type: String
  },
  type: { // 网格类型
    type: Number,
    required: true,
    default: 0,
    enum: [0, 1]
  },
  center: { // 中心点
    type: String
  },
  scope: { // 坐标范围
    type: String
  },
  pids: [{ // 负责人列表
    name: { // 负责人名称
      type: String
    },
    mobile: { // 负责人电话
      type: String
    }
  }],
  loc: { // 二位地理坐标
    required: true,
    type: String
  },
  bids: [{ // 该网格下的所有楼宇
    type: Schema.Types.ObjectId,
    ref: 'Building'
  }],
  rgbColor: { // 颜色
    type: String
  },
  style: {
    borderStyle: { // 边框样式
      type: String
    },
    borderWidth: { // 边框宽度
      type: String
    },
    borderColor: { // 边框颜色
      type: String
    },
    borderTransparency: { // 边框透明度
      type: Number
    },
    fillColor: { // 填充颜色
      type: String
    },
    fillColorTransparency: { // 填充透明度
      type: Number
    },
    font: { // 字体
      type: String
    },
    fontColor: { // 字体颜色
      type: String
    },
    fontRegular: { // 字体粗细
      type: String
    },
    fontSize: { // 字体大小
      type: String
    }
  }
}, { timestamps: true })

mongoose.model('Grid', GridSchema)
