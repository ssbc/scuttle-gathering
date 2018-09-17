const { heads } = require('ssb-sort')
const getBacklinks = require('./get-backlinks')

module.exports = function getHeads (server) {
  return function (gathering, cb) {
    getBacklinks(server)(gathering, (err, backlinks) => {
      if (err) cb(err)
      else cb(null, heads([gathering, ...backlinks]))
    })
  }
}
