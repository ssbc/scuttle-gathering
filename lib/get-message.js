const unboxMsg = require('./unbox-message')

module.exports = function (server) {
  return function getMessage (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      unboxMsg(server)({ key, value }, cb)
    })
  }
}
