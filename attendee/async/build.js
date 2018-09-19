const { isAttendee } = require('ssb-gathering-schema')

module.exports = function (server) {
  return function buildAttendee (gatheringKey, isAttending, cb) {
    if (!cb) return buildAttendee(gatheringKey, true, isAttending)

    const content = { type: 'about', about: gatheringKey }
    content.attendee = isAttending
      ? { link: server.id }
      : { link: server.id, remove: true }

    // TODO add branch link in update/async/build.js
    // this isn't as critical as that case though :)

    if (isAttendee(content)) cb(null, content)
    else cb(isAttendee.errors || new Error('Gathering attendee malformed', content))
  }
}
