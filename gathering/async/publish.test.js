const { group } = require('tape-plus')
const Scuttle = require('../../')
const Server = require('../../lib/testbot')
const getBacklinks = require('../../lib/get-backlinks')

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

    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err, 'no error')
      t.equal(gathering.value.content.type, 'gathering', 'calls back with gathering msg')

      getBacklinks(server)(gathering, (err, backlinks) => {
        if (err) console.log(err)

        t.true(backlinks.length === 1, 'there is only one backlink')
        t.equal(backlinks[0].value.content.type, 'about', 'the backlink is an about message')
        done()
      })
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
      description: 'it\'s been a hell of a year. come join us to celebrate the start of this gorgeous human'
    }

    scuttle.gathering.async.publish(opts, (err, data) => {
      t.true(err, 'complains about lack of startDateTime')
      // console.log(err)
      t.false(data, 'no publish')

      done()
    })
  })
})
