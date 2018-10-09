const Server = require('scuttle-testbot')

module.exports = function (opts) {
  const server = Server
    .use(require('ssb-backlinks'))
    .use(require('ssb-private'))
    .call(opts)

  return server
}
