/*
 * 电视墙工具类
 * @Author: chenkaibo
 * @Date: 2018-06-06 15:10:22
 * @Last Modified by: chenkaibo
 * @Last Modified time: 2018-10-10 13:48:30
 */

exports.getNowScene = plan => {
  const now = new Date()
  const nowS = now.getTime()
  now.setHours(0)
  now.setMinutes(0)
  now.setSeconds(0)
  const zeroTody = now.getTime()
  const time = Math.ceil((zeroTody - nowS) / 1000)
  const target = plan.info.find(({ start, end }) => time >= start && time <= end)
  return target && target.scene
}
exports.checkAddName = async (schema, name, wall) => {
  const res = await schema.find({ name, wall })
  return res.length
}
exports.checkModifyName = async (schema, id, name, wall) => {
  const res = await schema.find({ name, wall })
  let flag = false
  res.forEach(item => {
    if (item._id + '' !== id + '' && item.name + '' === name + '') { flag = true }
  })
  return flag
}
