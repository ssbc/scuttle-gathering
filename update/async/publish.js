const buildUpdate = require('./build')

module.exports = function (server) {
  return function publishGatheringUpdate (gatheringKey, opts, cb) {
    buildUpdate(gatheringKey, opts, (err, update) => {
      if (err) return cb(err)

      server.publish(update, cb)
    })
  }
}

