// miniprogram/pages/reply_grocery/reply_grocery.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    grocery: null,
    message: '',
    fromid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.id) {
      this.setData({
        _id: options.id
      })
      this.initData()
    } else {
      wx.navigateBack()
    }

  },
  initData: function () {
    this.loadDataFromCloud()
  },
  loadDataFromCloud () {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('grocery').where({
      _id: this.data._id
    }).get().then(res => {
      console.log(res)
      Toast.clear()
      wx.stopPullDownRefresh()
      if (res.data.length >= 1) {
        this.setData({
          grocery: res.data[0]
        })
      } else {
        wx.navigateBack()
      }

    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onChange: function (event) {
    console.log(event)
    this.setData({
      message: event.detail
    })
  },
  onPost: function (event) {
    console.log('我获取到的formid是' + event.detail.formId)
    this.setData({
      formid: event.detail.formId
    })
    if (this.data.message && this.data.message !== '') {
      this.setStates(this.data.message)
    } else {
      Toast('还没输入回复内容呢~~')
    }
  },
  //设置提问人的状态已被回答
  setStates: function (message) {
    const db = wx.cloud.database()
    db.collection('grocery').doc(this.data.grocery._id).update({
      data: {
        'answer_status': 1
      }
    }).then(res => {
      this.addMessage(message)
    })

  },
  //
  addMessage: function (message) {

    ///消息推送
    wx.cloud.callFunction({
      name: 'pushMsg',
      data: {
        formId: this.data.formid,
        toUser: this.data.grocery._openid,
        nick:this.data.grocery.nick,
        msg:this.data.grocery.question,
        content:message
      },
      success(res) {
        console.log(res)
      },
      failed(err) {
        console.log(err)
      }

    })

    const db = wx.cloud.database()
    let that = this
    let gender = '管理员'
    let nick = '货郎大叔'
    let avatarUrl = 'cloud://hoolly-0100c0.686f-hoolly-0100c0/boss.png'
    db.collection('grocery').add({
      data: {
        question: message,
        answer_status: 1,
        ctime: '来自不明时空',
        to: that.data.grocery._openid,
        gender: gender,
        nick: nick,
        avatarUrl: avatarUrl

      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        Toast.success({
          mask: true,
          message: '回复成功~',
          duration: 1500
        })
        setTimeout(function () {
          wx.navigateBack()
        }, 1500)

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '糟糕，有bug~'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.initData()
  }
})