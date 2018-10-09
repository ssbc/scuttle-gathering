const { group } = require('tape-plus')
const { isAttendee } = require('ssb-gathering-schema')
const Scuttle = require('../../')
const Server = require('../../lib/testbot')

group('attendee.async.publish', test => {
  var server
  var scuttle

  test.beforeEach(t => {
    server = Server()
    scuttle = Scuttle(server)
  })
  test.afterEach(t => {
    server.close()
  })

  const opts = {
    title: 'ziva\'s birthday party',
    description: 'it\'s been a hell of a year. come join us to celebrate the start of this gorgeous human',
    startDateTime: {
      epoch: Date.now() + 5000
    }
  }

  test('happy path, attending', (t, done) => {
    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err, 'no err')

      scuttle.attendee.async.publish(gathering.key, (err, msg) => {
        t.false(err, 'no error')
        t.true(isAttendee(msg))

        done()
      })
    })
  })

  test('happy path, not attending', (t, done) => {
    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err, 'no err')

      scuttle.attendee.async.publish(gathering.key, false, (err, msg) => {
        t.false(err, 'no error')
        t.true(isAttendee(msg))

        done()
      })
    })
  })

  test('happy path, attending (private)', (t, done) => {
    const _opts = Object.assign({}, opts, {
      recps: [
        server.id,
        {
          link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhRg=.ed25519',
          name: 'SoapDog'
        }
      ]
    })

    scuttle.gathering.async.publish(_opts, (err, gathering) => {
      t.false(err, 'no err')

      scuttle.attendee.async.publish(gathering.key, (err, msg) => {
        t.false(err, 'no error')
        t.true(isAttendee(msg))
        t.equal(msg.value.private, true, 'is private')
        t.deepEqual(msg.value.content.recps, _opts.recps, 'same recps as gathering')

        done()
      })
    })
  })
})
