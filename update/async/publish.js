const buildUpdate = require('./build')
const publish = require('../../lib/publish-message')

module.exports = function (server) {
  return function publishGatheringUpdate (gatheringKey, opts, cb) {
    buildUpdate(server)(gatheringKey, opts, (err, update) => {
      if (err) return cb(err)

      publish(server)(update, cb)
    })
  }
}
