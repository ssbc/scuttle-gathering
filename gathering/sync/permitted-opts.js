const pick = require('lodash.pick')
const PERMITTED_OPTS = 'progenitor mentions recps'
  .split(' ')

module.exports = function permittedOpts (opts) {
  return pick(opts, PERMITTED_OPTS)
}
