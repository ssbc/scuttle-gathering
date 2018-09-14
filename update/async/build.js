const pick = require('lodash.pick')
const { isUpdate } = require('ssb-gathering-schema')

const KEYS = 'title startDateTime location description image'
  .split(' ')

module.exports = function buildUpdate (gatheringKey, opts, cb) {
  if (gatheringKey === null) gatheringKey = '%DummyKey++Qn5L+xP696fLq6qfIvRS4DBt4QXicas0A=.sha256'
  // This is for the initial case of publishing a gathering where we don't have the gatheringKey yet

  const content = Object.assign(
    { type: 'about', about: gatheringKey },
    pick(opts, KEYS)
  )

  if (isUpdate(content)) cb(null, content)
  else cb(isUpdate.errors || new Error('Gatherings expected valid update info, got', opts))
}
