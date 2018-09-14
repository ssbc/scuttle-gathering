const buildAttendee = require('./build')

module.exports = function (server) {
  return function publishAttendee (gatheringKey, isAttending, cb) {
    buildAttendee(server)(gatheringKey, isAttending, (err, content) => {
      if (err) return cb(err)

      server.publish(content, cb)
    })
  }
}
