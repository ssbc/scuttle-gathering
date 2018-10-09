const { isUpdate } = require('ssb-gathering-schema')
const { isGathering } = require('ssb-gathering-schema')
const getHeads = require('../../lib/get-heads')
const getMsg = require('../../lib/get-message')
const permittedOpts = require('../sync/permitted-opts')

module.exports = function (server) {
  return function buildUpdate (gatheringOrKey, opts, cb) {
    const content = Object.assign(
      { type: 'about' },
      permittedOpts(opts)
    )

    if (gatheringOrKey === null) {
      content.about = '%DummyKey++Qn5L+xP696fLq6qfIvRS4DBt4QXicas0A=.sha256'
      // this supports us pre-checking valid data for initial gathering update
      // the gatheringKey is over-written later in gathering/async/publish.js
      // the branch is also set to this there
      return done(content)
    }

    const root = gatheringOrKey.key || gatheringOrKey
    content.about = root

    getMsg(server)(root, (err, gathering) => {
      if (err) return cb(err)
      if (!isGathering(gathering)) return cb(new Error('Gathering updates must target valid gatherings!'))

      const { recps } = gathering.value.content
      if (recps) content.recps = recps

      getHeads(server)(gathering, (err, heads) => {
        if (err) return cb(err)

        content.branch = heads
        done(content)
      })
    })

    function done (content) {
      if (isUpdate(content)) cb(null, content)
      else cb(isUpdate.errors || new Error('Gatherings expected valid update info, got', opts))
    }
  }
}
