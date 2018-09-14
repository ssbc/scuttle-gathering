const inject = require('scuttle-inject')

const raw = require('./methods')
const PLUGIN_DEPS = []

const niceMappings = {}

module.exports = function (server, opts) {
  const methods = Object.assign({}, raw, niceMappings)

  return inject(server, methods, PLUGIN_DEPS)
}
