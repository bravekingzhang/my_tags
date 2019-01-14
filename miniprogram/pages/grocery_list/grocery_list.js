// miniprogram/pages/grocery_list/grocery_list.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    grocery_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  onPullDownRefresh () {
    this.initData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initData()
  },
  initData: function () {
    Toast.clear()
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
  onAddQuestion: function (question) {
    const db = wx.cloud.database()
    let that = this
    let gender = '不男不女'
    let nick = '路人甲'
    let avatarUrl = ''
    if (this.data.userInfo) {
      if (this.data.userInfo.gender === 1) {
        gender = '男'
      } else {
        gender = '女'
      }
      nick = this.data.userInfo.nickName
      avatarUrl = this.data.userInfo.avatarUrl
    }
    db.collection('grocery').add({
      data: {
        question: question,
        answer_status: 0,
        ctime: that.getFormatDate(that.getTimeStamp()),
        to: 'admin',
        gender: gender,
        nick: nick,
        avatarUrl: avatarUrl

      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        Toast.success({
          mask: true,
          message: '恭喜！你的疑惑已经在穿越不确定的时空，浪矢爷爷会在不确定的时间收到并回复你，请常来杂货店看看~',
          duration: 0
        })

        setTimeout(function () {
          that.initData()
        }, 3500)
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '糟糕，浪矢杂货店受到不明磁场干扰，请贵宾稍后再试~'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  loadDataFromCloud () {
    const db = wx.cloud.database()
    let currentGrocerys = []
    const _ = db.command

    console.log(this.data.openId)
    db.collection('grocery').where(_.or([
      {
        to: _.eq('admin')
      }
    ])).get().then(res => {
      console.log(res)
      Toast.clear()
      wx.stopPullDownRefresh()
      currentGrocerys = res.data
      this.setData({
        grocery_list: currentGrocerys
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
      question: event.detail
    })
  },
  onClose: function (event) {
    if (event.detail === 'confirm') {
      if (this.data.question && this.data.question !== '') {
        this.onAddQuestion(this.data.question)
      } else {
        Toast('浪矢爷爷还不知道你要问什么疑惑呢~')
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
  }
})