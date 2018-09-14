const buildUpdate = require('../../update/async/build')

module.exports = function (server) {
  return function publishGathering (opts, cb) {
    buildUpdate(null, opts, (err, update) => {
      if (err) return cb(err)

      if (!update.title) return cb(new Error('New gatherings need a title'))
      if (!update.startDateTime) return cb(new Error('New gatherings need a startDateTime!'))

      server.publish({type: 'gathering'}, (err, gathering) => {
        if (err) return cb(err)

        update.about = gathering.key
        server.publish(update, cb)
      })
    })
  }
}
