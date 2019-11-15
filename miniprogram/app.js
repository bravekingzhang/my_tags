//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    
    this.globalData = {
      showBtn:false
    }
    this.loadDataFromCloud()
  },
  loadDataFromCloud() {
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('prefs').get().then(res => {
      let data = res.data[0]
      let showBtn = data.showBtn
      this.globalData.showBtn = showBtn;
      console.log('app showBtn  '+showBtn)
    })
  },
})