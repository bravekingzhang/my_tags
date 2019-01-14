//index.js
//获取应用实例
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

const app = getApp()

Page({
  data: {
    version: '1.2.0',
    desc: '随心，随意，快乐生活~',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    white_list: [],
    openId: '',
    show_grocery_list: false,
    pref:null
  },
  loadDataFromCloud () {
    const db = wx.cloud.database()
    const _ = db.command

    console.log(this.data.openId)
    db.collection('prefs').get().then(res => {
      Toast.clear()
      wx.stopPullDownRefresh()
      let data = res.data[0];
      let white_list = data.white_list
      let version = data.version
      this.setData({
        pref:data,
        version:version,
        white_list: white_list,
        show_grocery_list: white_list.indexOf(this.data.openId) !== -1
      })
    })
  },
  onLoad: function () {
    if (app.globalData.openId) {
      this.setData({
        openId: app.globalData.openId,
      })
    } else {
      this.onGetOpenid().then(res => {
        this.setData({
          openId: res.result.openid,
        })
      })
    }
    //获取用户基本信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.loadDataFromCloud()
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  feedback: function (e) {
    wx.navigateTo({
      url: '../../pages/feedback/feedback'
    })
  },
  grocery_answer: function () {
    wx.navigateTo({
      url: '../../pages/grocery_list/grocery_list'
    })
  }
})
