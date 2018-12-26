// pages/addFunction/addFunction.js

const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`

Page({

  data: {
    result: '',
    canIUseClipboard: wx.canIUse('setClipboardData'),
  },

  onLoad: function (options) {

  },

  copyCode: function() {
    wx.setClipboardData({
      data: code,
      success: function () {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },

  testFunction() {
    var that = this
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        a: 1,
        b: 2
      }
    }).then(function(res){
      wx.showToast({
        title: '调用成功',
      })
      that.setData({
        result: JSON.stringify(res.result)
      })
    }).catch(function(err){
      wx.showToast({
        icon: 'none',
        title: '调用失败',
      })
      console.error('[云函数] [sum] 调用失败：', err)
    })
  },

})

