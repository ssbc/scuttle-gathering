const { unbox, loadOrCreateSync: loadKeys } = require('ssb-keys')
const Config = require('ssb-config/inject')
const { join } = require('path')

module.exports = function unboxMessage (msg, keys) {
  if (typeof msg.value.content === 'object') return msg

  const plaintext = unbox(msg.value.content, keys || getKeys())
  if (!plaintext) {
    return null // hmmm
  }

  msg.value.content = plaintext
  msg.value.private = true

  return msg
}

var keys = null
function getKeys () {
  if (!keys) {
    console.log('scuttle-gathering: loading keys')

    const config = Config(process.env.ssb_appname)
    keys = loadKeys(join(config.path, 'secret'))
  }

  return keys
}
