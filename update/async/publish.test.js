const { group } = require('tape-plus')
const Scuttle = require('../../')
const Server = require('../../lib/testbot')
const getBacklinks = require('../../lib/get-backlinks')

group('update.async.publish', test => {
  var server
  var scuttle

  test.beforeEach(t => {
    server = Server()
    scuttle = Scuttle(server)
  })
  test.afterEach(t => {
    server.close()
  })

  test('populates branch correctly', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday',
      startDateTime: {
        epoch: Date.now() + 5000,
        tz: 'Pacific/ Auckland'
      }
    }

    // publish Gathering and initialUpdate
    scuttle.gathering.async.publish(opts, (err, gathering) => {
      if (err) console.error(err)

      getBacklinks(server)(gathering, (err, backlinks) => {
        if (err) console.error(err)

        const [ initialUpdate ] = backlinks
        t.equal(initialUpdate.value.content.branch, gathering.key, 'initial update has backlink of gathering')

        const opts = {
          title: 'Ziva\'s Birtdhay',
          location: 'our place in Mirimar'
        }
        // publish secondUpdate
        scuttle.update.async.publish(gathering, opts, (err, data) => {
          if (err) console.error(err)
          console.error('test err')

          getBacklinks(server)(gathering, (err, backlinks) => {
            if (err) console.error(err)

            const [ initialUpdate, secondUpdate ] = backlinks
            t.deepEqual(secondUpdate.value.content.branch, [initialUpdate.key], 'second update has backlink of initial update')

            done()
          })
        })
      })
    })
  })
})
