const Server = require('scuttle-testbot')

module.exports = function (opts) {
  const server = Server
    .use(require('ssb-backlinks'))
    .call(opts)

  return server
}
