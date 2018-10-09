const { isGathering, isAttendee } = require('ssb-gathering-schema')
const getMsg = require('../../lib/get-message')

module.exports = function (server) {
  return function buildAttendee (gatheringKey, isAttending, cb) {
    if (!cb) return buildAttendee(gatheringKey, true, isAttending)

    getMsg(server)(gatheringKey, (err, gathering) => {
      if (err) return cb(err)
      if (!isGathering(gathering)) return cb(new Error('scuttle-gathering only allows you to visit a mark attendance of valid gatherings'))

      const content = {
        type: 'about',
        about: gatheringKey,
        attendee: isAttending ? { link: server.id } : { link: server.id, remove: true }
      }

      const recps = gathering.value.content.recps
      if (recps) content.recps = recps

      // TODO add branch link in update/async/build.js
      // this isn't as critical as that case though :)

      if (!isAttendee(content)) return cb(isAttendee.errors || new Error('Gathering attendee malformed', content))

      cb(null, content)
    })
  }
}
