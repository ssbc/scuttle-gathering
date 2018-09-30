const pick = require('lodash.pick')
const PERMITTED_OPTS = 'title startDateTime location description image recps'
  .split(' ')

module.exports = function permittedOpts (opts) {
  return pick(opts, PERMITTED_OPTS)
}
