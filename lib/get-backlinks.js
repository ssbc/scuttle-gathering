const pull = require('pull-stream')

module.exports = function getBacklinks (server) {
  return function (gathering, cb) {
    const query = [{
      $filter: {
        dest: gathering.key
      }
    }]
    pull(
      server.backlinks.read({ query }),
      pull.collect((err, msgs) => {
        if (err) return cb(err)

        const backlinks = msgs
          .filter(m => {
            return (m.value.content.about === gathering.key) || (m.value.content.root === gathering.key)
          })

        cb(null, backlinks)
      })
    )
  }
}
