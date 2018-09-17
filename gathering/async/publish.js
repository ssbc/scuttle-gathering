const buildUpdate = require('../../update/async/build')

module.exports = function (server) {
  return function publishGathering (opts, cb) {
    buildUpdate(server)(null, opts, (err, update) => {
      if (err) return cb(err)

      if (!update.title) return cb(new Error('New gatherings need a title'))
      if (!update.startDateTime) return cb(new Error('New gatherings need a startDateTime!'))

      server.publish({ type: 'gathering' }, (err, gathering) => {
        if (err) return cb(err)

        update.about = gathering.key
        update.branch = gathering.key
        server.publish(update, (err, update) => {
          if (err) cb(err)
          else cb(null, gathering)
        })
      })
    })
  }
}
