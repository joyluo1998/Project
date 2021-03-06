const version = '1.0.0.42'
export default {
  data() {
    return {
      debug: false,
      pluginDownloadUrl: `${window.location.protocol}//${window.location.host}/static/plugin/BlueSkyWebPlayerSetup.exe`,
      showDownload: false,
      showTips: ''
    }
  },
  methods: {
    showHelp() {
      this.$Modal.warning({
        title: '帮助',
        content: '由于Chrome和Firefox的高级版本去掉了对PPAPI的支持, 插件仅支持IE(非Edge)及支持PPAPI的浏览器, 如Firefox的延长支持版、360极速版等。'
      })
    },
    delay(time) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    videoPage() {
      let plugin = this.$store.getters.plugin
      if (!plugin.valid) {
        this.showDownload = true
        this.showTips = '未安装插件，点击下载'
      } else if (version !== plugin.version) {
        const arr1 = version.split('.')
        const arr2 = plugin.version.split('.')
        let hasNew = false
        if (arr2.length >= arr1.length) {
          arr2.forEach((i, index) => {
            const v = arr1[index] || 0
            if (Number(i) < Number(v)) {
              hasNew = true
            }
          })
        } else {
          arr1.forEach((i, index) => {
            const v = arr2[index] || 0
            if (Number(i) > Number(v)) {
              hasNew = true
            }
          })
        }
        if (!hasNew) {
          hasNew = !plugin.IsSupportPicAdjust()
        }
        if (hasNew) {
          this.showDownload = true
          this.showTips = '插件有更新，点击下载'
        }
      }
      plugin = null
    }
  },
  created() {
    if (this.debug) {
      return
    }
    if (this.usePage === 'video') {
      try {
        this.videoPage()
      } catch (e) {
        console.log(e)
      }
    }
  }
}
