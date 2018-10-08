const ssbKeys = require('ssb-keys')
const { isFeed } = require('ssb-ref')

module.exports = function publishMessage (server) {
  return function (content, cb) {
    server.publish(box(content), cb)
  }
}

// this relies on upstream validators to be checking that the content (including recps) is valid
function box (content) {
  if (!content.recps) return content
  if (!content.recps.length) {
    delete content.recps
    return content
  }

  return ssbKeys.box(content, content.recps.map(e => isFeed(e) ? e : e.link))
}
