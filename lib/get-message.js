const { unbox, loadOrCreateSync: loadKeys } = require('ssb-keys')
const { isMsg } = require('ssb-ref')
const Config = require('ssb-config/inject')
const { join } = require('path')


module.exports = function (server) {
  return function getMessage (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      const msg = { key, value }
      if (typeof value.content === 'object') return cb(null, msg)

      const plaintext = unbox(msg.value.content, getKeys()) 
      if (!plaintext) null

      msg.value.content = plaintext
      msg.value.private = true

      cb(null, msg)
    })
  }
}

var keys = null
function getKeys () {
  if (!keys) {
    console.log('loading keys')
    keys = loadKeys()
  }

  return keys
}
