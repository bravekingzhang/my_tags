//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    tagEle: [],
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  innit: function () {
    const db = wx.cloud.database()
    var tagEle = []
    db.collection('tags').get().then(res => {
      for (var i = 0; i < res.data.length; i++) {
        var object = {
          title: res.data[i].tag,
          c: "#33ffff",
          x: 0,
          y: 0,
          z: 0,
          s: 0,
          o: 1,
          f: 15,
          angleX: 0,
          angleY: 0
        }
        tagEle.push(object)
      }
      for (var i = 0; i < tagEle.length; i++) {
        var fallLength = 100 //圆的焦点
        var angleX = Math.PI / 100
        var angleY = Math.PI / 100
        var k = (2 * (i + 1) - 1) / tagEle.length - 1;
        //计算按圆形旋转
        var a = Math.acos(k);
        var b = a * Math.sqrt(tagEle.length * Math.PI);
        //计算元素x，y坐标
        var numx = 120 * Math.sin(a) * Math.cos(b)
        var numy = 120 * Math.sin(a) * Math.sin(b);
        var numz = 220 * Math.cos(a);

        // console.log(numo)
        //计算元素缩放大小
        tagEle[i].x = numx * 2
        tagEle[i].y = numy * 2
        tagEle[i].z = numz
        tagEle[i].s = 250 / (400 - tagEle[i].z)
      }
      setInterval(() => {
        for (var i = 0; i < tagEle.length; i++) {
          var a = Math.acos(k);
          var numz = 240 * Math.cos(a);
          tagEle[i].s = 250 / (400 - tagEle[i].z)
          var cos = Math.cos(angleX);
          var sin = Math.sin(angleX);
          var y1 = tagEle[i].y * cos - tagEle[i].z * sin;
          var z1 = tagEle[i].z * cos + tagEle[i].y * sin;
          tagEle[i].y = y1;
          tagEle[i].z = z1;

          var cos = Math.cos(angleY);
          var sin = Math.sin(angleY);
          var x1 = tagEle[i].x * cos - tagEle[i].z * sin;
          var z1 = tagEle[i].z * cos + tagEle[i].x * sin;
          tagEle[i].x = x1;
          tagEle[i].z = z1;
          tagEle[i].c = this.getRandomColor()
          this.setData({
            tagEle: tagEle
          })
        }
      }, 100)
    })


  },
  getRandomColor: function () {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  onShow: function () {
    // this.innit();
  },
  onReady: function () {
    this.innit();
  },
  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              console.log(res)
            }
          })
        }
      }
    })
  },

  addTagClick: function () {
    // wx./
  },

  getRandomTag: function () {
    var letters = ['2B青年', '文艺青年', '高兴', '快乐', '讽刺', '寒冷', '很无辜', '气氛', '我勒个去', '还在干嘛'];
    var tag = letters[Math.floor(Math.random() * letters.length)];
    return tag;
  },
  onAddTag: function () {
    var tagGen = this.getRandomTag()
    const db = wx.cloud.database()
    db.collection('tags').add({
      data: {
        tag: tagGen
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        var tagObj = {
          title: tagGen,
          c: "#33ffff",
          x: 0,
          y: 0,
          z: 0,
          s: 0,
          o: 1,
          f: 15,
          angleX: 0,
          angleY: 0
        }
        var tags = this.data.tagEle;
        tags.push(tagObj)
        this.setData({
          tagEle: tags
        })
        wx.showToast({
          title: '新增标签成功',
        })
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
  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
})