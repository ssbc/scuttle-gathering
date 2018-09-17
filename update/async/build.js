const pick = require('lodash.pick')
const { isUpdate } = require('ssb-gathering-schema')
const { isGathering } = require('ssb-gathering-schema')
const getHeads = require('../../lib/get-heads')

module.exports = function (server) {
  return function buildUpdate (gatheringOrKey, opts, cb) {
    const content = Object.assign({ type: 'about' }, permittedOpts(opts))

    if (gatheringOrKey === null) {
      content.about = '%DummyKey++Qn5L+xP696fLq6qfIvRS4DBt4QXicas0A=.sha256'
      // this supports us pre-checking valid data for initial gathering update
      // the gatheringKey is over-written later in gathering/async/publish.js
      // the branch is also set to this there
      done(content)
    } else {
      const root = gatheringOrKey.key || gatheringOrKey

      server.get(root, (err, value) => {
        if (err) return cb(err)

        const gathering = { key: root, value }
        if (!isGathering(gathering)) return cb(new Error('Gathering updates must target valid gatherings!'))

        getHeads(server)(gathering, (err, heads) => {
          if (err) return cb(err)

          content.about = root
          content.branch = heads
          done(content)
        })
      })
    }

    function done (content) {
      if (isUpdate(content)) cb(null, content)
      else cb(isUpdate.errors || new Error('Gatherings expected valid update info, got', opts))
    }
  }
}

function permittedOpts (opts) {
  const ALLOWED_OPTS = 'title startDateTime location description image'
    .split(' ')

  return pick(opts, ALLOWED_OPTS)
}
