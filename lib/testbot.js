const Server = require('scuttle-testbot')

module.exports = function (opts) {
  return Server
    .use(require('ssb-backlinks'))
    .call(opts)
}
