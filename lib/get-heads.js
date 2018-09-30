const { heads } = require('ssb-sort')
const getBacklinks = require('./get-backlinks')

module.exports = function getHeads (server) {
  if (arguments.length !== 1 || typeof arguments[0] !== 'object') throw new Error('getHeads needs a server as it\'s first argument!')

  return function (gathering, cb) {
    getBacklinks(server)(gathering, (err, { thread, backlinks }) => {
      if (err) cb(err)
      else cb(null, heads([gathering, ...thread]))
    })
  }
}
