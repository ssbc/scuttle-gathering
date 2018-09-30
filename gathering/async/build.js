const { isGathering } = require('ssb-gathering-schema')
const permitted = require('../sync/permitted-opts')

module.exports = function buildGathering (opts, cb) {
  const gathering = Object.assign(
    { type: 'gathering' },
    permitted(opts)
  )

  if (isGathering(gathering)) cb(null, gathering)
  else cb(isGathering.errors)
}
