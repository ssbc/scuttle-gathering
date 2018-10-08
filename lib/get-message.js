const unboxMsg = require('./unbox-message')

module.exports = function (server) {
  return function getMessage (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      cb(null, unboxMsg({ key, value }))
    })
  }
}
