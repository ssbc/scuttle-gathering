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
          .reduce((acc, update) => merge(acc, update), {})

        cb(null, merge(doc, updates))
      })
    })
  }
}
