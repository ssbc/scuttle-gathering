const { isUpdate, isAttendee } = require('ssb-gathering-schema')
const merge = require('lodash.merge')
const getBacklinks = require('../../lib/get-backlinks')
const permittedOpts = require('../../lib/permitted-opts')

module.exports = function (server) {
  return function getGathering (key, cb) {
    server.get(key, (err, value) => {
      if (err) return cb(err)

      const doc = { key, value }

      getBacklinks(server)(doc, (err, backlinks) => {
        if (err) return cb(err)

        const updates = backlinks
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

        cb(null, merge(doc, updates, { attendees }))
      })
    })
  }
}
