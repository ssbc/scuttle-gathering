const ssbKeys = require('ssb-keys')
const { isFeed } = require('ssb-ref')
const unboxMsg = require('./unbox-message')

module.exports = function publishMessage (server) {
  return function (content, cb) {
    server.publish(box(content), (err, msg) => {
      if (err) return cb(err)
      unboxMsg(server)(msg, cb)
    })
  }
}

// this relies on upstream validators to be checking the recps are valid
function box (content) {
  if (!content.recps) return content
  if (!content.recps.length) {
    delete content.recps
    return content
  }

  return ssbKeys.box(content, content.recps.map(e => isFeed(e) ? e : e.link))
}
