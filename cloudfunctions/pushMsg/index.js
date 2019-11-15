// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  return sendTemplateMessage(event)
}

//小程序模版消息推送
async function sendTemplateMessage(event) {
  // const {
  //   OPENID
  // } = cloud.getWXContext()
  // 接下来将新增模板、发送模板消息、然后删除模板
  // 注意：新增模板然后再删除并不是建议的做法，此处只是为了演示，模板 ID 应在添加后保存起来后续使用


  const templateId = '1f6I2VbQBWtZnTeKmYSV8ObbOldfxqROGxgJhWr_Au4' //新增的模版id

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: event.toUser,
    templateId,
    formId: event.formId,
    page: 'pages/grocery/grocery',
    data: {
      keyword1: {
        value: event.nick,
      },
      keyword2: {
        value: event.msg,
      },
      keyword3: {
        value: event.content,
      },
      keyword4: {
        value: '浪矢爷爷',
      },
    }
  })

  return sendResult
}