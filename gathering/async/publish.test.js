const { group } = require('tape-plus')
const Server = require('scuttle-testbot')
const Scuttle = require('../../')

group('gathering.async.publish', test => {
  var server
  var scuttle

  test.beforeEach(t => {
    server = Server()
    scuttle = Scuttle(server)
  })
  test.afterEach(t => {
    server.close()
  })

  test('happy path', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday party',
      description: 'it\'s been a hell of a year. come join us to celebrate the start of this gorgeous human',
      startDateTime: {
        epoch: Date.now() + 5000
      }
    }

    scuttle.gathering.async.publish(opts, (err, data) => {
      t.false(err, 'no error')
      t.true(data.key && data.value, 'happy message data')
      // console.log(JSON.stringify(data, null, 2))

      done()
    })
  })

  test('missing title', (t, done) => {
    const opts = {
      description: 'it\'s been a hell of a year. come join us to celebrate the start of this gorgeous human',
      startDateTime: {
        epoch: Date.now() + 5000
      }
    }

    scuttle.gathering.async.publish(opts, (err, data) => {
      t.true(err, 'complains about lack of title')
      // console.log(err)
      t.false(data, 'no publish')

      done()
    })
  })

  test('missing startDateTime', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday party',
      description: 'it\'s been a hell of a year. come join us to celebrate the start of this gorgeous human',
    }

    scuttle.gathering.async.publish(opts, (err, data) => {
      t.true(err, 'complains about lack of startDateTime')
      // console.log(err)
      t.false(data, 'no publish')

      done()
    })
  })
})
