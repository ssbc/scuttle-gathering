const { isUpdate, isAttendee } = require('ssb-gathering-schema')
const { heads } = require('ssb-sort')
const merge = require('lodash.merge')
const getBacklinks = require('../../lib/get-backlinks')
const permittedOpts = require('../../lib/permitted-opts')

const EMPTY_DOC = {
  key: '',
  title: '',
  location: '',
  description: ''
}

module.exports = function (server) {
  return function getGathering (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      const gathering = { key, value }

      getBacklinks(server)(gathering, (err, backlinks) => {
        if (err) return cb(err)

        const doc = merge({},
          EMPTY_DOC,
          {
            key,
            thread: backlinks,
            heads: heads([gathering, ...backlinks])
          },
          reduceUpdates(backlinks),
          reduceAttendees(server.id, backlinks)
        )
        cb(null, doc)
      })
    })
  }
}

function reduceUpdates (backlinks) {
  return backlinks
    .filter(isUpdate)
    .map(m => permittedOpts(m.value.content))
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

function reduceAttendees (myKey, backlinks) {
  const attendees = backlinks
    .filter(isAttendee)
    .reduce((acc, msg) => {
      const { link, remove } = msg.value.content.attendee
      // only trust attendee calls from people themselves for now
      if (msg.value.author !== link) return acc

      if (remove) {
        return acc.filter(feedId => feedId !== link)
      } else {
        if (acc.includes(link)) return acc
        else return [...acc, link]
      }
    }, [])

  return {
    isAttendee: attendees.includes(myKey),
    attendees
  }
}
