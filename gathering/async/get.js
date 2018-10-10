const { isUpdate, isAttendee } = require('ssb-gathering-schema')
const { heads } = require('ssb-sort')
const merge = require('lodash.merge')
const getMsg = require('../../lib/get-message')
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
    getMsg(server)(key, (err, gathering) => {
      if (err) return cb(err)

      getBacklinks(server)(gathering, (err, data) => {
        if (err) return cb(err)

        const { thread, backlinks } = data
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

      if (update.mentions) delete update.mentions

      return merge(acc, update)
    }, { images: [] })
}

function reduceAttendees (myKey, thread) {
  const { attendees, notAttendees } = thread
    .filter(isAttendee)
    .reduce((acc, msg) => {
      const { link: feedId, remove } = msg.value.content.attendee
      // only trust attendee calls from people themselves for now
      if (msg.value.author !== feedId) return acc

      if (remove) {
        add(acc.notAttendees, feedId)
        strip(acc.attendees, feedId)
      } else {
        add(acc.attendees, feedId)
        strip(acc.notAttendees, feedId)
      }

      return acc
    }, { attendees: [], notAttendees: [] })

  return {
    isAttendee: attendees.includes(myKey),
    attendees,
    notAttendees
  }
}

function strip (arr, id) {
  const i = arr.findIndex(el => el === id)
  if (i < 0) return

  arr.splice(i, 1)
}

function add (arr, id) {
  if (!arr.includes(id)) arr.push(id)
}
