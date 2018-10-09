const inject = require('scuttle-inject')
const merge = require('lodash.merge')

const raw = require('./methods')
const PLUGIN_DEPS = ['backlinks', 'private']

const niceMappings = {
  get: raw.gathering.async.get,
  post: raw.gathering.async.publish,
  put: raw.update.async.publish,
  attending: raw.attendee.async.publish
}

module.exports = function (server, opts) {
  const methods = merge(niceMappings, raw)

  return inject(server, methods, PLUGIN_DEPS)
}
