module.exports = function (server) {
  return function (msg, cb) {
    if (typeof msg.value.content === 'object') return cb(null, msg)

    server.private.unbox(msg, cb)
  }
}

// NOTE
// if sending messages over muxrpc for decryption sucks this could be useful:

// const { unbox, loadOrCreateSync: loadKeys } = require('ssb-keys')
// const Config = require('ssb-config/inject') <<< new dependency
// const { join } = require('path')

// var keys = null
// module.exports = function (server) {
//   return function unboxMessage (msg, cb) {
//     if (typeof msg.value.content === 'object') return msg
//     if (!keys) keys = getKeys()

//     const plaintext = unbox(msg.value.content, keys)
//     if (!plaintext) {
//       return cb(null, null) // hmmm
//     }

//     msg.value.content = plaintext
//     msg.value.private = true

//     return msg
//   }

//   function getKeys () {
//     if (keys) return keys

//     console.log('scuttle-gathering: loading keys')

//     // scuttle-testbot has keys attached to it
//     if (server.keys && server.keys.private) {
//       keys = server.keys.private
//       return keys
//     }

//     // ssb-client case, you have to go and get the keys directly
//     const config = Config(process.env.ssb_appname)
//     keys = loadKeys(join(config.path, 'secret'))
//     return keys
//   }
// }
