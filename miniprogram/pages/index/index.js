//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast'

let app = getApp()
let interval = undefined
Page({
  data: {
    tags: [],
    logged: false,
    takeSession: false,
    requestResult: '',
    show: false,
    openId: '',
    inputTag: '',
    formid:''
  },
  onPullDownRefresh () {
    this.initData()
  },
  onReady: function () {
    this.initData()
  },
  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib'
      })
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              console.log(res)
            }
          })
        }
      }
    })
  },

  initData: function () {
    if (interval) {
      clearInterval(interval)
    }
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
        app.globalData.openId = res.result.openid
        return new Promise(function (resolve) {
          resolve(res)
        })
      }).then(res => {
        this.loadDataFromCloud()
      })
    }
  },
  loadDataFromCloud: function () {
    const db = wx.cloud.database()
    let currentTags = []
    db.collection('tags').where({
      _openid: this.data.openId
    }).get().then(res => {
      Toast.clear()
      wx.stopPullDownRefresh()
      for (let i = 0; i < res.data.length; i++) {
        let tag = {
          title: res.data[i].tag,
          c: '#000000',
          x: 0,
          y: 0,
          z: 0,
          scale: 0,
          o: 0.8,
          f: 15,
          angleX: 0,
          angleY: 0
        }
        currentTags.push(tag)
      }
      console.log(currentTags)
      for (let i = 0; i < currentTags.length; i++) {
        let k = (2 * (i + 1) - 1) / currentTags.length - 1
        //计算按圆形旋转
        let a = Math.acos(k)
        let b = a * Math.sqrt(currentTags.length * Math.PI)
        //计算元素x，y坐标
        let numx = 60 * Math.sin(a) * Math.cos(b)
        let numy = 60 * Math.sin(a) * Math.sin(b)
        let numz = 100 * Math.cos(a)
        //计算元素缩放大小
        currentTags[i].x = numx * 2
        currentTags[i].y = numy * 2
        currentTags[i].z = numz
        currentTags[i].scale = 250 / (200 - currentTags[i].z)
      }
      interval = setInterval(() => {
        let angleX = Math.PI / 150
        for (let i = 0; i < currentTags.length; i++) {
          currentTags[i].scale = 250 / (200 - currentTags[i].z)
          let cos = Math.cos(angleX)
          let sin = Math.sin(angleX)
          let x1 = currentTags[i].x * cos - currentTags[i].z * sin
          let y1 = currentTags[i].y * cos - currentTags[i].z * sin
          let z1 = currentTags[i].z * cos + currentTags[i].y * sin
          currentTags[i].x = x1
          currentTags[i].y = y1
          currentTags[i].z = z1
          currentTags[i].c = this.getRandomColor()
          this.setData({
            tags: currentTags
          })
        }
      }, 100)
    })
  },
  getRandomColor: function () {
    let letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  },
  addTagClick: function () {
    // wx./
    this.setData({
      show: true
    })
  },
  onAddTag: function (tagGen) {
    const db = wx.cloud.database()
    db.collection('tags').add({
      data: {
        tag: tagGen
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '新增标签成功'
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
          title: '新增标签失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
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
        this.onAddTag(this.data.inputTag)
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
  }
})