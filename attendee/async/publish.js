const buildAttendee = require('./build')

module.exports = function (server) {
  return function publishAttendee (gatheringKey, isAttending, cb) {
    if (!cb) return publishAttendee(gatheringKey, true, isAttending)

    buildAttendee(server)(gatheringKey, isAttending, (err, content) => {
      if (err) return cb(err)

      server.publish(content, cb)
    })
  }
}
