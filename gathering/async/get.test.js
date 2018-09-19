const { group } = require('tape-plus')
const Server = require('../../lib/testbot')
const { isMsg } = require('ssb-ref')
const Scuttle = require('../../')

group('gathering.async.get', test => {
  var now = Date.now()
  var server
  var scuttle

  test.beforeEach(t => {
    server = Server()
    scuttle = Scuttle(server)
  })
  test.afterEach(t => {
    server.close()
  })

  test('gets document', (t, done) => {
    setupGathering((err, gathering) => {
      if (err) console.error(err)

      scuttle.gathering.async.get(gathering.key, (err, doc) => {
        t.false(err, 'no error')

        t.true(isMsg(doc.key), 'valid key')

        t.equal(doc.title, 'ziva\'s birthday', 'has title')
        t.deepEqual(doc.startDateTime, { epoch: now + 750, tz: 'Pacific/ Auckland' }, 'has edited time startDateTime')
        t.equal(doc.location, 'our place in mirimar')

        t.equal(doc.description, '', 'unset String field returns empty string')

        t.deepEqual(doc.image, { link: '&AnotherImage//z3os/qA9+YJndRmbJQXl8LYfBquz4=.sha256' }, 'has single image')
        t.deepEqual(doc.images, [
          {
            link: '&l/Mr4CqSFYtCsrz3os/qA9+YJndRmbJQXl8LYfBquz4=.sha256',
            name: 'orange-grove-helpers.jpg',
            size: 1049416,
            type: 'image/jpeg'
          },
          { link: '&AnotherImage//z3os/qA9+YJndRmbJQXl8LYfBquz4=.sha256' }
        ], 'has all images added')

        t.deepEqual(doc.attendees, [ server.id ], 'shows me attending')
        scuttle.attendee.async.publish(gathering.key, false, (err, attendee) => {
          if (err) throw (err)
          scuttle.gathering.async.get(gathering.key, (err, doc) => {
            if (err) throw (err)
            t.deepEqual(doc.attendees, [], 'shows me no longer attending')

            done()
          })
        })
      })
    })
  })

  // helper
  function setupGathering (cb) {
    var epoch = now + 5000

    const initialGathering = {
      title: 'ziva\'s birthday',
      startDateTime: {
        epoch,
        tz: 'Pacific/ Auckland'
      },
      image: {
        link: '&l/Mr4CqSFYtCsrz3os/qA9+YJndRmbJQXl8LYfBquz4=.sha256',
        name: 'orange-grove-helpers.jpg',
        size: 1049416,
        type: 'image/jpeg'
      }
    }

    const anUpdate = {
      startDateTime: { epoch: now + 750 },
      location: 'our place in mirimar',
      image: {
        'link': '&AnotherImage//z3os/qA9+YJndRmbJQXl8LYfBquz4=.sha256'
      }
    }

    // publish gathering
    scuttle.gathering.async.publish(initialGathering, (err, gathering) => {
      if (err) return cb(err)

      // make an update
      scuttle.update.async.publish(gathering.key, anUpdate, (err, update) => {
        if (err) return cb(err)

        // attend it
        scuttle.attendee.async.publish(gathering.key, (err, attendee) => {
          if (err) return cb(err)

          cb(null, gathering)
        })
      })
    })
  }
})
