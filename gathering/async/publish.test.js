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
      },
      progenitor: '%WO7WjRFL64mNxgFjrP9jauAVWQ3UZaEMwW7p6EtGyQw=.sha256',
      mentions: [
        { link: '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519', name: 'dominic' },
        { link: '@+oaWWDs8g73EZFUMfW37R/ULtFEjwKN/DczvdYihjbU=.ed25519', name: 'christian' },
        '@U5GvOKP/YUza9k53DSXxT0mk3PIrnyAmessvNfZl5E0=.ed25519'
      ]
      // TODO - this was failing ... will come back and do this when i get to private gatherings
      // TODO - enable recps as an accepted field in permitted opts
      // recps: [
      //   server.id,
      //   {
      //     link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhRg=.ed25519',
      //     name: 'SoapDog'
      //   }
      // ]
    }

    scuttle.gathering.async.publish(opts, (err, gathering) => {
      if (err) console.log(opts)
      t.false(err, 'no error')

      const { type, progenitor, mentions } = gathering.value.content
      // const { type, progenitor, mentions, recps } = gathering.value.content

      t.equal(type, 'gathering', 'calls back with gathering msg')
      t.deepEqual(progenitor, opts.progenitor, 'progenitor')
      t.deepEqual(mentions, opts.mentions, 'mentions')
      // t.deepEqual(recps, opts.recps, 'recps')

      getBacklinks(server)(gathering, (err, { thread, backlinks }) => {
        if (err) console.log(err)

        t.true(thread.length === 1, 'there is only one backlink')
        t.equal(thread[0].value.content.type, 'about', 'the backlink is an about message')
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

  test('broken mentions', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday party',
      startDateTime: {
        epoch: Date.now() + 5000
      },
      mentions: 'dominic!'
    }

    scuttle.gathering.async.publish(opts, (err, data) => {
      t.true(err, 'complains about faulty mentions')
      // console.log(err)
      t.false(data, 'no publish')

      done()
    })
  })
})
