// pages/motto/motto.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

Page({

  data: {
    mottos: [],
    openId: '',
    inputTag: ''
  },
  onPullDownRefresh () {
    this.initData()
  },
  onReady: function () {
    this.initData()
  },
  initData: function () {
    this.setData({
      inputTag: ''
    })
    Toast.loading({
      mask: true,
      message: '加载中...',
      duration: 0
    })
    this.onGetOpenid().then(res => {
      this.setData({
        openId: res.result.openid
      })
      return new Promise(function (resolve) {
        resolve(res)
      })
    }).then(res => {
      this.loadDataFromCloud()
    })
  },

  loadDataFromCloud () {
    const db = wx.cloud.database()
    let currentMottos = []
    const _ = db.command

    console.log(this.data.openId)
    db.collection('mottos').where({
      _openid: _.eq(this.data.openId)
    }).get().then(res => {
      console.log(res)
      Toast.clear()
      wx.stopPullDownRefresh()
      currentMottos = res.data
      this.setData({
        mottos: currentMottos
      })
    })
  },

  onGetOpenid: function () {
    // 调用云函数
    return wx.cloud.callFunction({
      name: 'login',
      data: {}
    })
  },

  onLoad: function (options) {
  }
})