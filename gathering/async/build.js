const { isGathering } = require('ssb-gathering-schema')
const permitted = require('../sync/permitted-opts')

module.exports = function buildGathering (opts, cb) {
  if (opts.recps) opts.recps = opts.recps.map(getLink)

  const gathering = Object.assign(
    { type: 'gathering' },
    permitted(opts)
  )

  if (isGathering(gathering)) cb(null, gathering)
  else cb(isGathering.errors)
}

function getLink (recp) {
  if (typeof recp === 'string') return recp
  return recp.link
}
