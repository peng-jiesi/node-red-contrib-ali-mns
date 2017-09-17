/**
 * node-red-contrib-ali-mns ali-mns
 * Created by pengj on 2017-9-15.
 */
const AliMNS = require('ali-mns')

module.exports = function (RED) {
  function AliMnsSms (config) {
    RED.nodes.createNode(this, config)

    const {TemplateCode, FreeSignName, accountId, accessKeyId, accessKeySecret, topic, region} = config

    const account = new AliMNS.Account(accountId, accessKeyId, accessKeySecret)
    const aliTopic = new AliMNS.Topic(topic, account, region)

    const node = this
    node.on('input', function (msg) {
      const {Receiver, SmsParams} = msg.payload

      if (!(Receiver && SmsParams)) {
        node.error('Payload must has "Receiver" and "SmsParams"')
        msg.mns = 'Payload must has "Receiver" and "SmsParams"'
        node.send(msg)
        return false
      }

      const sms = {
        FreeSignName: FreeSignName,  // (必选，短信签名)。
        TemplateCode: TemplateCode,  // (必选，短信模板ID)。
        Type: 'singleContent',  // (必选，singleContent或multiContent，表示单发或批量。如果取值为multiContent，则只会被Endpoint为sms:directsms:anonymous 的订阅处理)。
        Receiver: Receiver,  // (如果Type为singleContent且Subscription的Endpoint是sms:directsms:anonymous ，则此项生效且必填，填写接收人的手机号码，多个号码以逗号分隔)。
        SmsParams: SmsParams   // (必选，json格式，一些具体参数。对于singleContent，此处填写格式为{“参数1”:”Value1”,”参数2”:”Value2”}；对于multiContent，此处填写格式为{“电话号码1”:{“参数1”:”Value1”,”参数2”:”Value2”}, “电话号码2”:{“参数1”:”Value3”,”参数2”:”Value4”}})。
      }

      aliTopic.publishP('node-red-contrib-ali-mns', true, 'node-red', {DirectSMS: JSON.stringify(sms)})
        .then((resp) => {
          console.log(resp)
          msg.mns = resp
          node.send(msg)
        }, node.error)
    })
  }

  RED.nodes.registerType('ali-mns-sms', AliMnsSms)
}
