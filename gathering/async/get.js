const { isUpdate, isAttendee } = require('ssb-gathering-schema')
const { heads } = require('ssb-sort')
const merge = require('lodash.merge')
const getBacklinks = require('../../lib/get-backlinks')
const permittedGathering = require('../sync/permitted-opts')
const permittedUpdates = require('../../update/sync/permitted-opts')

const EMPTY_DOC = {
  title: '',
  location: '',
  description: ''
}

module.exports = function (server) {
  return function getGathering (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      const gathering = { key, value }

      getBacklinks(server)(gathering, (err, { thread, backlinks }) => {
        if (err) return cb(err)

        const doc = merge(
          { key },
          permittedGathering(gathering.value.content),
          EMPTY_DOC,
          {
            thread,
            backlinks,
            heads: heads([gathering, ...thread])
          },
          reduceUpdates(thread),
          reduceAttendees(server.id, thread)
        )
        cb(null, doc)
      })
    })
  }
}

function reduceUpdates (thread) {
  return thread
    .filter(isUpdate)
    .map(m => permittedUpdates(m.value.content))
    .reduce((acc, update) => {
      const { image } = update
      if (image) {
        acc.image = image
        if (!acc.images.find(i => i.link === image.link)) acc.images.push(image)
        delete update.image
      }

      return merge(acc, update)
    }, { images: [] })
}

function reduceAttendees (myKey, thread) {
  const [attendees, unAttendees] = thread
    .filter(isAttendee)
    .reduce(([accAttendee, accUnattendee], msg) => {
      const { link, remove } = msg.value.content.attendee
      // only trust attendee calls from people themselves for now
      if (msg.value.author !== link) return acc

      if (remove) {
        accAttendee = accAttendee.filter(feedId => feedId !== link)
        if(!accUnattendee.includes(link)) {
          accUnattendee = [...accUnattendee, link]
        }
      } else {
        accUnattendee = accUnattendee.filter(feedId => feedId !== link)
        if (!accAttendee.includes(link)) {
          accAttendee = [...accAttendee, link]
        }
      }
      return [accAttendee, accUnattendee]
    }, [[], []])

  return {
    isAttendee: attendees.includes(myKey),
    attendees,
    unAttendees
  }
}
