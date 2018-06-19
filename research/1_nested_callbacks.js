const pull = require('pull-stream')
const Client = require('ssb-client')
const config = require('./config')

Client(config.keys, config, (err, server) => {
  if (err) throw err

  const myKey = server.id

  const startTime = new Date()

  // a) get all my `about` messages where I say something about attending
  pull(
    attendanceStreamForFeed(myKey, server),
    pull.collect((err, attendingData) => {
      console.log('a) time:', (new Date() - startTime) / 1000, 's')

      const attending = attendingData.reduce((soFar, item) => {
        // b) only keep the ones where the last thing I said about it was that I was attending (remove === null)
        if (last(item.rm) === null) soFar.push(item.root)

        return soFar
      }, [])
      console.log('b) time:', (new Date() - startTime) / 1000, 's')

      // c) get any gathering which matches one of those things I'm attending
      pull(
        gatheringStreamFilteredByKeys(attending, server),
        pull.collect((err, gatherings) => {
          console.log('c) time:', (new Date() - startTime) / 1000, 's')

          // console.log(gatherings)

          server.close()
        })
      )
    })
  )
})

function attendanceStreamForFeed (feedId, server) {
  const attendanceQuery = {
    query: [
      {
        $filter: {
          value: {
            author: feedId, // i authored the message
            content: {
              type: 'about',
              about: { $prefix: '%' }, // it's referencing a message
              attendee: {
                link: feedId // i'm asserting something about myself
              }
            }
          }
        }
      },
      {
        $map: {
          root: ['value', 'content', 'about'], // could be a gathering
          remove: ['value', 'content', 'attendee', 'remove'], // not attending
          ts: ['value', 'timestamp'] // timestamp
        }
      },
      {
        $reduce: {
          root: 'root',
          rm: { $collect: 'remove' }
        }
      }
    ]
  }

  // server.query.explain(attendanceQuery, (err, a) => console.log('Resolved level query (reveals index in use)', a))

  return server.query.read(attendanceQuery)
}

function gatheringStreamFilteredByKeys (keys, server) {
  const gatheringQuery = {
    query: [
      {
        $filter: {
          // key: {$in: keys}, // needs a new map-filter-reduce
          value: {
            timestamp: { $gt: 0 }, // this forces an index which is ordered by published ts
            content: { type: 'gathering' }
          }
        }
      }
    ]
  }

  // server.query.explain(gatheringQuery, (err, a) => console.log('Resolved level query (reveals index in use)', a))

  // return server.query.read(gatheringQuery)
  return pull(
    server.query.read(gatheringQuery),
    pull.filter(m => keys.includes(m.key))
  )
}

function last (arr) {
  if (!arr.length) return

  return arr[arr.length - 1]
}
