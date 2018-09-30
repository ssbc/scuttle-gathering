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
      pull.collect((err, _msgs) => {
        if (err) return cb(err)

        const msgs = _msgs.reduce((acc, m) => {
          if ((m.value.content.about === key) || (m.value.content.root === key)) acc.thread.push(m)
          else acc.backlinks.push(m)

          return acc
        }, { thread: [], backlinks: [] })

        const sorted = sort([ gathering, ...msgs.thread ])
        sorted.shift()
        // remove gathering after sort
        // putting gathering into the sort is paranoid and is thinking ahead to a time without timestamps
        msgs.thread = sorted

        cb(null, msgs)
      })
    )
  }
}
