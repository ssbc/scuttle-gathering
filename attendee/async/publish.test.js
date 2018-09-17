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
      scuttle.attendee.async.publish(gathering.key, (err, msg) => {
        t.false(err, 'no error')
        t.true(isAttendee(msg))

        done()
      })
    })
  })

  test('happy path, not attending', (t, done) => {
    scuttle.gathering.async.publish(opts, (err, gathering) => {
      scuttle.attendee.async.publish(gathering.key, false, (err, msg) => {
        t.false(err, 'no error')
        t.true(isAttendee(msg))

        done()
      })
    })
  })
})
