const WebSocket = require('ws')
const events = require('events')
const eventEmitter = new events.EventEmitter()
// ------- 过sdk服务测试数据--------

const testData = [{
  '_id': 'aaa',
  stream: 'main',
  name: '测试资源',
  id: 'vvvvv',
  ip: '192.168.20.56',
  port: '554',
  channelid: 1,
  rtsp: {
    main: 'rtsp://192.168.20.56:554/main/id=4'
  },
  verifaceUrl: 'ws://192.168.20.26:8061/video?analyze=true&record=stranger&crop=face&threshold=' + encodeURIComponent('20,20,20,0.5') + '&interval=1000&url=' + encodeURIComponent('rtsp://192.168.20.7:554/main/id=6') + '&group=' +
    ['5b0d6b0d17bd6d4f1862c70a',
      '5b0d6b0d17bd6d4f1862c70b',
      '5b0d6b0d17bd6d4f1862c70c',
      '5b162aa5b6d9cc3a60065f43',
      '5b164dd2e95533475417444c'].join(',')
}]
const ws = new WebSocket('ws://192.168.20.26:8061/video?analyze=true&record=stranger&crop=face&threshold=' + encodeURIComponent('20,20,20,0.5') + '&interval=1000&url=' + encodeURIComponent('rtsp://192.168.20.7:554/main/id=6') + '&group=' + '')
ws.on('open', function () {
  eventEmitter.emit('veriFaceData', '连接成功')
})
ws.on('message', async function (data) {
  eventEmitter.emit('veriFaceData', testData)
})
ws.on('error', function (error) {
  console.warn('SDKsocketErr:', error.message)
})
const data = const data = { 'type': 'recognize', 'track': 0, 'pts': 18599, 'timestamp': 1544237324930, 'face': { 'rect': { 'left': 1047, 'top': 364, 'width': 74, 'height': 75 }, 'quality': 0.5425314, 'confidence': 0.9999752, 'crop': { 'rect': { 'left': 1010, 'top': 288, 'width': 148, 'height': 188 }, 'image': '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' }, 'attrs': { 'age': 20.9971, 'pose': { 'roll': 3.8055112, 'yaw': -7.9929543, 'pitch': 2.5519116 }, 'gender': { 'male': 0.9995316, 'female': 0.00046839504 }, 'face_quality': { 'blurness': 0.45746863 }, 'acceptable': 0.97911185, 'gender_type': 0 } }, 'result': [{ 'group': '5b75360e5697ed6a9ee47c79', 'photos': [{ 'id': 6, 'tag': '5c09d1a55499a7aa3d5ab3c6', 'score': 83.60112 }, { 'id': 1, 'tag': '5bc44bff515cc28c8c611da7', 'score': 33.749126 }, { 'id': 4, 'tag': '5bc71483285aa7435474dbff', 'score': 28.10129 }, { 'id': 2, 'tag': '5bc45464cd9b5d33d4f69977', 'score': 28.10129 }, { 'id': 3, 'tag': '5bc454a4cd9b5d33d4f6997b', 'score': 28.10129 }] }, { 'group': '5b75360e5697ed6a9ee47c7b', 'photos': [{ 'id': 8, 'tag': '5bc5830d285aa7435474d763', 'score': 28.035698 }, { 'id': 2, 'tag': '5b76210ba747e76a9e29423e', 'score': 28.035698 }, { 'id': 23, 'tag': '5beafca622117b2fa11170a2', 'score': 18.225359 }] }, { 'group': '5b75360e5697ed6a9ee47c7a', 'photos': [] }, { 'group': '5b754a145697ed6a9ee487b7', 'photos': [{ 'id': 18, 'tag': '5c089a41f0a35424ec2ce3a1', 'score': 83.60112 }, { 'id': 8, 'tag': '5b755741a747e76a9e293b9c', 'score': 40.728985 }, { 'id': 6, 'tag': '5b755684a747e76a9e29393e', 'score': 37.89 }, { 'id': 2, 'tag': '5b755585a747e76a9e293856', 'score': 37.18532 }, { 'id': 7, 'tag': '5b755698a747e76a9e29395c', 'score': 26.286877 }, { 'id': 11, 'tag': '5b762093a747e76a9e294208', 'score': 24.522757 }, { 'id': 3, 'tag': '5b7555a5a747e76a9e293876', 'score': 23.777685 }, { 'id': 9, 'tag': '5b761f8aa747e76a9e29416e', 'score': 22.290504 }, { 'id': 4, 'tag': '5b7555cea747e76a9e29388c', 'score': 22.25881 }, { 'id': 19, 'tag': '5c08bae6ff2b62a84108407d', 'score': 18.225359 }] }] }