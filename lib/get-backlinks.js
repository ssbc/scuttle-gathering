const pull = require('pull-stream')
const sort = require('ssb-sort')
const { isMsg } = require('ssb-ref')
const { isGathering } = require('ssb-gathering-schema')

module.exports = function getBacklinks (server) {
  if (arguments.length !== 1 || typeof arguments[0] !== 'object') throw new Error('getBacklinks needs a server as it\'s first argument!')

  return function (gathering, cb) {
    if (!isGathering(gathering)) return cb(new Error('getBacklinks requires a valid gathering message'))

    const key = gathering.key
    if (!isMsg(key)) return cb(new Error('getBacklinks requires a valid gathering message'))
    const query = [{
      $filter: { dest: key }
    }]
    pull(
      server.backlinks.read({ query }),
      pull.filter(m => {
        return (m.value.content.about === key) || (m.value.content.root === key)
      }),
      pull.collect((err, backlinks) => {
        if (err) return cb(err)

        const sorted = sort([ gathering, ...backlinks ])
        sorted.shift()
        // remove gathering after sort
        // putting gathering into the sort is paranoid and is thinking ahead to a time without timestamps

        cb(null, sorted)
      })
    )
  }
}
