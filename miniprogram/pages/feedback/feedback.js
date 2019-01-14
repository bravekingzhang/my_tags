import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: '',
    rate: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onChange (event) {
    this.setData({
      rate: event.detail
    })
  },
  onInputFinished: function (e) {
    console.log(e)
    this.setData(
      {
        message: e.detail.value
      }
    )
  },
  sendFeedBack: function () {
    let that = this
    setTimeout(function () {
      that.doFeedBack()
    }, 500)
  },
  doFeedBack: function () {
    if (this.data.message == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入反馈内容'
      })
      return
    }
    const db = wx.cloud.database()
    db.collection('feedbacks').add({
      data: {
        feedback: this.data.message,
        rate: this.data.rate
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '反馈成功'
        })
        let that = this
        setTimeout(function () {
          wx.navigateBack()
        }, 1500)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '反馈失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  }
})