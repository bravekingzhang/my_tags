// miniprogram/pages/reply_grocery/reply_grocery.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    grocery: null,
    message: ''
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
          grocery: res.data[0],
          message: res.data[0].answer || ''
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
    if (this.data.message && this.data.message !== '') {
      this.setStates(this.data.message)
    } else {
      Toast('还没输入回复内容呢~~')
    }
  },
  //设置提问人的状态已被回答
  setStates: function (message) {
    console.log(message)
    console.log(this.data.grocery._id)
    // 当然 promise 方式也是支持的
    //update方法需要使用云函数才能成功，呵呵
    wx.cloud.callFunction({
      name: 'grocery',
      data: {
        _id: this.data.grocery._id,
        message: message
      }
    }).then(res => {
      Toast.success({
        mask: true,
        message: '回复成功~',
        duration: 1500
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '糟糕，有bug~'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.initData()
  }
})