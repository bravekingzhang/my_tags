// pages/motto/motto.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

let app = getApp()
Page({

  data: {
    mottos: [],
    openId: '',
    inputTag: '',
    show: false
  },
  onPullDownRefresh () {
    this.initData()
  },
  onReady: function () {
    this.initData()
  },
  onShareAppMessage: function () {

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
    if (app.globalData.openId) {
      this.setData({
        openId: app.globalData.openId
      })
      this.loadDataFromCloud()
    } else {
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
    }
  },
  addMottoClick: function () {
    this.setData({
      show: true
    })
  },
  onAddMotto: function (tagGen) {
    const db = wx.cloud.database()
    db.collection('mottos').add({
      data: {
        motto: tagGen
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '新增格言成功'
        })
        let that = this
        setTimeout(function () {
          that.initData()
        }, 1500)
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增格言失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  loadDataFromCloud () {
    const db = wx.cloud.database()
    let currentMottos = []
    const _ = db.command

    console.log(this.data.openId)
    db.collection('mottos').where({
      _openid: _.eq(this.data.openId).or(_.eq('admin'))
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
  onChange: function (event) {
    console.log(event)
    this.setData({
      inputTag: event.detail
    })
  },
  onClose: function (event) {
    if (event.detail === 'confirm') {
      if (this.data.inputTag && this.data.inputTag !== '') {
        this.onAddMotto(this.data.inputTag)
      } else {
        Toast('还没输入标签呢~~')
      }
      // 异步关闭弹窗
      setTimeout(() => {
        this.setData({
          show: false
        })
      }, 1000)
    } else {
      this.setData({
        show: false
      })
    }
  },
  onLoad: function (options) {
  }
})