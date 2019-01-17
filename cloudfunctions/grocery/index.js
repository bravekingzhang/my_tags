// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {_id,message } = event
  
  try {
    return await db.collection('grocery').doc(_id).update({
      data: {
        "answer_status":1,
        "answer":message
      }
    })
  } catch (e) {
    console.error(e)
  }
}