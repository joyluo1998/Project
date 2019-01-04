const iconStyleScale = 0.4
const iconStyleAnchor = [48, 48]
const StyleConfig = {
  // 默认的绘制样式---
  defaultDrawStyle: {
    iconStyle: {
      url: '/static/video_halfball_unsave.png',
      scale: 1,
      anchor: [0, 2],
      rotation: 0,
      opacity: 1
    },
    textStyle: {
      label: '',
      labelXOffset: 35,
      labelYOffset: 35,
      fillColor: '#ff0000',
      outLineColor: '00ff00',
      outLineWidth: 5,
      lineDash: [1]
    },
    circleStyle: {
      fillColor: '#ffff00',
      strokeStyle: {
        outLineWidth: 2,
        outLineColor: '#6666aa'
      },
      radius: 3
    },
    strokeStyle: {
      outLineColor: '#000080',
      outLineWidth: 2,
      lineDash: [1]
    },
    fillColor: '#ffffff'
  },
  // 胡红勋 报警箱保存样式----2018-09-05 所有点位编辑模式下的图标-----------------
  alarmBoxSaveSymbol: {
    iconStyle: {
      url: '/static/alarm_box_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 胡红勋 报警柱报警样式----2018-09-05
  alarmColumnSaveSymbol: {
    iconStyle: {
      url: '/static/alarm_column_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 半球类型 点位未保存时的样式
   */
  halfBallUnSSymbol: {
    iconStyle: {
      url: '/static/video_halfball_unsave.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 半球类型 点位编辑时的样式
   */
  halfBallEditSymbol: {
    iconStyle: {
      url: '/static/video_halfball_edi.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 半球类型 点位保存后的样式
   */
  halfBallSaveSymbol: {
    iconStyle: {
      url: '/static/video_halfball_save.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 快球类型 点位未保存时的样式
   */
  fastBallUnSSymbol: {
    iconStyle: {
      url: '/static/video_ball_unsave.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 快球类型 点位编辑时的样式
   */
  fastBallEditSymbol: {
    iconStyle: {
      url: '/static/video_ball_edi.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 快球类型 点位保存后的样式
   */
  fastBallSaveSymbol: {
    iconStyle: {
      url: '/static/video_ball_save.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 枪机类型 点位未保存时的样式
   */
  boltUnSSymbol: {
    iconStyle: {
      url: '/static/video_gun_unsave.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 枪机类型 点位编辑时的样式
   */
  boltEditSymbol: {
    iconStyle: {
      url: '/static/video_gun_edi.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 枪机类型 点位保存后的样式
   */
  boltSaveSymbol: {
    iconStyle: {
      url: '/static/video_gun_save.png',
      rotation: 0,
      opacity: 1,
      size: [30, 30],
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 红外枪机类型 点位未保存时的样式
   */
  redBoltUnSSymbol: {
    iconStyle: {
      url: '/static/video_gunred_unsave.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 红外枪机类型 点位编辑时的样式
   */
  redBoltEditSymbol: {
    iconStyle: {
      url: '/static/video_gunred_edi.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 红外枪机类型 点位保存后的样式
   */
  redBoltSaveSymbol: {
    iconStyle: {
      url: '/static/video_gunred_save.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 全景类型 点位未保存时的样式
   */
  allViewUnSSymbol: {
    iconStyle: {
      url: '/static/video_allview_unsave.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 全景类型 点位编辑时的样式
   */
  allViewEditSymbol: {
    iconStyle: {
      url: '/static/video_allview_edi.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 全景类型 点位保存后的样式
   */
  allViewSaveSymbol: {
    iconStyle: {
      url: '/static/video_allview_save.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
   /**
   * 报警 未保存时的样式
   */
  alarmPointUnSSymbol: {
    iconStyle: {
      url: '/static/alarm_unsave.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 普通报警 编辑时的样式
   */
  alarmPointEditSymbol: {
    iconStyle: {
      url: '/static/alarm_edit.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 普通报警 保存后的样式
   */
  alarmPointSaveSymbol: {
    iconStyle: {
      url: '/static/alarm_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 消防报警 编辑的样式
   */
  fireAlarmPointEditSymbol: {
    iconStyle: {
      url: '/static/fireAlarm_edit.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 消防报警 保存后的样式
   */
  fireAlarmPointSaveSymbol: {
    iconStyle: {
      url: '/static/fireAlarm_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 消防报警 在线的样式
   */
  fireAlarmPointOnlineSymbol: {
    iconStyle: {
      url: '/static/fireAlarm_online.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 消防报警 离线的样式
   */
  fireAlarmPointOfflineSymbol: {
    iconStyle: {
      url: '/static/fireAlarm_offline.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
      opacity: 1
    }
  },
  /**
   * 报警主机 编辑的样式
   */
  alarmHostPointEditSymbol: {
    iconStyle: {
      url: '/static/alarmHost_edit.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警主机 保存后的样式
   */
  alarmHostPointSaveSymbol: {
    iconStyle: {
      url: '/static/alarmHost_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警主机 在线的样式
   */
  alarmHostPointOnlineSymbol: {
    iconStyle: {
      url: '/static/alarmHost_online.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警主机 离线的样式
   */
  alarmHostPointOfflineSymbol: {
    iconStyle: {
      url: '/static/alarmHost_offline.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更点位未保存的样式---
  patrolUnSSymbol: {
    iconStyle: {
      url: '/static/patrol_unsave.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更点位编辑的样式-------
  patrolEditSymbol: {
    iconStyle: {
      url: '/static/patrol_edit.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更点位保存后的样式-----
  patrolSaveSymbol: {
    iconStyle: {
      url: '/static/patrol_save.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 所有点位编辑模式下的图标，分为未保存、编辑、保存三种状态--------结束
  // 所有点位应用模式下的图标，分为在线、离线两种状态--------开始---
  /**
   * 快球类型 点位在线状态
   */
  fastBallVedioOnlineSymbol: {
    iconStyle: {
      url: '/static/vedio_ball_online.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 半球类型 点位在线状态
   */
  halfBallVedioOnlineSymbol: {
    iconStyle: {
      url: '/static/video_halfball_online.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 枪机类型 点位在线状态
   */
  boltVedioOnlineSymbol: {
    iconStyle: {
      url: '/static/video_gun_online.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 红外枪机类型 点位在线状态
   */
  redBoltVedioOnlineSymbol: {
    iconStyle: {
      url: '/static/video_gunred_online.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 全景类型 点位在线状态
   */
  allViewVedioOnlineSymbol: {
    iconStyle: {
      url: '/static/video_allview_online.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 快球类型 点位离线状态
   */
  fastBallVedioOfflineSymbol: {
    iconStyle: {
      url: '/static/vedio_ball_off.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 半球类型 点位离线状态
   */
  halfBallVedioOfflineSymbol: {
    iconStyle: {
      url: '/static/video_halfball_off.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 枪机类型 点位离线状态
   */
  boltVedioOfflineSymbol: {
    iconStyle: {
      url: '/static/video_gun_off.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 红外枪机类型 点位离线状态
   */
  redBoltVedioOfflineSymbol: {
    iconStyle: {
      url: '/static/video_gunred_off.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 全景类型 点位离线状态
   */
  allViewVedioOfflineSymbol: {
    iconStyle: {
      url: '/static/video_allview_off.png',
      rotation: 0,
      opacity: 1,
      anchor: iconStyleAnchor,
      scale: iconStyleScale
    }
  },
  /**
   * 应用模式点位高亮样式
   */
  hightLightSymbol: {
    iconStyle: {
      url: '/static/select.png',
      anchor: [25, 40],
      scale: 0.8
    }
  },
  /**
   * 报警 布防样式
   */
  alarmPointArmSymbol: {
    iconStyle: {
      url: '/static/alarm_arming.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警 撤防样式
   */
  alarmPointUnarmSymbol: {
    iconStyle: {
      url: '/static/alarm_unarm.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警 在线样式
   */
  alarmPointOnlineSymbol: {
    iconStyle: {
      url: '/static/alarm_online.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警 离线样式
   */
  alarmPointOfflineSymbol: {
    iconStyle: {
      url: '/static/alarm_off.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  /**
   * 报警 报警样式
   */
  alarmPointAlarmSymbol: {
    iconStyle: {
      url: '/static/alarm_ing.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
    /**
   * 报警 消防报警样式
   */
  fireAlarmPointAlarmSymbol: {
    iconStyle: {
      url: '/static/fireAlarm_alarm.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 楼层上的巡更点位在楼宇上的汇聚图标---
  patrolFloorSymbol: {
    iconStyle: {
      url: '/static/patrol_conver.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更点汇聚报警样式
  patrolConverAlarmSymbol: {
    iconStyle: {
      url: '/static/patrol_conver_alarm.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 普通的巡更点图标
  patrolAppSymbol: {
    iconStyle: {
      url: '/static/patrol_online.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更状态：报警、维修、已巡更、超时、待巡更，各状态图标----开始-------
  patrolAlarmSymbol: {
    iconStyle: {
      url: '/static/patrol_alarm.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 维修
  patrolRepairSymbol: {
    iconStyle: {
      url: '/static/patrol_repair.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 已巡更
  patroledSymbol: {
    iconStyle: {
      url: '/static/patrol_ed.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 超时
  patrolTimeoutSymbol: {
    iconStyle: {
      url: '/static/patrol_timeout.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 待巡更
  patrolWaitSymbol: {
    iconStyle: {
      url: '/static/patrol_wait.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
   // 巡更状态：报警、维修、已巡更、超时、待巡更，各状态图标----结束-------
  // 巡更点位连线时的箭头
  arrowSymbol: {
    iconStyle: {
      url: '/static/arrow.png',
      anchor: [0, 10],
      scale: 1,
      rotation: 0,
      opacity: 1
    }
  },
  // 巡更连线样式
  patrolLineSymbol: {
    strokeStyle: {
      outLineColor: '#fe8134',
      outLineWidth: 2,
      lineDash: [1]
    }
  },
  // 单兵
  singleSymbol: {
    iconStyle: {
      url: '/static/movesingle.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 单兵报警
  singleAlarmSymbol: {
    iconStyle: {
      url: '/static/singlealarm.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    }
  },
  // 车辆轨迹线的样式
  carTrackSymbol: {
    strokeStyle: {
      outLineColor: 'rgba(221,112,48,1)',
      outLineWidth: 2,
      lineDash: [1]
    }
  },
  // 车辆轨迹点的样式
  carSymbol: {
    iconStyle: {
      url: '/static/car.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    },
    textStyle: {
      label: '',
      labelXOffset: 30,
      labelYOffset: 30,
      fillColor: '#0000ff',
      outLineColor: '00ff00',
      outLineWidth: 5,
      lineDash: [1],
      fontSize: 1
    }
  },
  peopleTrackSymbol: {
    iconStyle: {
      url: '/static/movesingle.png',
      anchor: iconStyleAnchor,
      scale: iconStyleScale,
      rotation: 0,
      opacity: 1
    },
    textStyle: {
      label: '',
      labelXOffset: 30,
      labelYOffset: 30,
      fillColor: '#0000ff',
      outLineColor: '00ff00',
      outLineWidth: 5,
      lineDash: [1],
      fontSize: 1
    }
  },
  peopleLineSymbol: {
    strokeStyle: {
      outLineColor: 'rgba(221,112,48,1)',
      outLineWidth: 2,
      lineDash: [1]
    }
  }
}
export default StyleConfig
