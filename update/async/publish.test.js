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

      getBacklinks(server)(gathering, (err, { thread }) => {
        t.false(err)

        const [ initialUpdate ] = thread
        t.equal(initialUpdate.value.content.branch, gathering.key, 'initial update has backlink of gathering')

        const opts = {
          title: 'Ziva\'s Birtdhay',
          location: 'our place in Mirimar'
        }
        // publish secondUpdate
        scuttle.update.async.publish(gathering, opts, (err, data) => {
          if (err) console.error(err)
          console.error('test err')

          getBacklinks(server)(gathering, (err, { thread, backlinks }) => {
            if (err) console.error(err)

            const [ initialUpdate, secondUpdate ] = thread
            t.deepEqual(secondUpdate.value.content.branch, [initialUpdate.key], 'second update has backlink of initial update')

            done()
          })
        })
      })
    })
  })

  test('private updates', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday (private)',
      startDateTime: {
        epoch: Date.now() + 5000,
        tz: 'Pacific/ Auckland'
      },
      recps: [
        server.id,
        {
          link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhRg=.ed25519',
          name: 'SoapDog'
        }
      ]
    }

    // publish Gathering and initialUpdate
    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err)

      getBacklinks(server)(gathering, (err, data) => {
        t.false(err)
        const { thread } = data

        const [ initialUpdate ] = thread
        const { content, cyphertext, private: isPrivate } = initialUpdate.value

        t.equal(content.branch, gathering.key, 'initial update has backlink of gathering')
        t.deepEqual(content.recps, opts.recps, 'same recps as gathering')
        t.equal(isPrivate, true, 'updates are private')
        t.true(cyphertext, 'updates are private (cyphertext)')

        done()
      })
    })
  })
})
