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
    }

    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err, 'no error')

      const { type, progenitor, mentions } = gathering.value.content

      t.equal(type, 'gathering', 'calls back with gathering msg')
      t.deepEqual(progenitor, opts.progenitor, 'progenitor')
      t.deepEqual(mentions, opts.mentions, 'mentions')

      getBacklinks(server)(gathering, (err, { thread, backlinks }) => {
        t.false(err)

        t.true(thread.length === 1, 'there is only one backlink')
        t.equal(thread[0].value.content.type, 'about', 'the backlink is an about message')
        done()
      })
    })
  })

  test('happy path (private gathering)', (t, done) => {
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
      ],
      recps: [
        server.id,
        {
          link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhRg=.ed25519',
          name: 'SoapDog'
        }
      ]
    }

    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.false(err, 'no error')
      server.get(gathering.key, (err, value) => {
        t.false(err, 'no error')
        t.equal(typeof value.content, 'string', 'encrypted gathering')

        getBacklinks(server)(gathering, (err, data) => {
          t.false(err, 'no getBacklinks error')

          const { thread } = data
          t.true(thread.length === 1, 'there is only one backlink')
          t.equal(thread[0].value.content.type, 'about', 'the backlink is an about message')
          done()
        })
      })
    })
  })

  test('unhappy path (private gathering)', (t, done) => {
    const opts = {
      title: 'ziva\'s birthday party',
      startDateTime: {
        epoch: Date.now() + 5000
      },
      mentions: [
        { link: '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519', name: 'dominic' },
        { link: '@+oaWWDs8g73EZFUMfW37R/ULtFEjwKN/DczvdYihjbU=.ed25519', name: 'christian' },
        '@U5GvOKP/YUza9k53DSXxT0mk3PIrnyAmessvNfZl5E0=.ed25519'
      ],
      recps: [
        server.id,
        { link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhRg=.ed25519', name: 'SoapDog' },
        { link: '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519', name: 'dominic' },
        { link: '@+oaWWDs8g73EZFUMfW37R/ULtFEjwKN/DczvdYihjbU=.ed25519', name: 'christian' },
        { link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhR2=.ed25519', name: 'SoapDog2' },
        { link: '@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCC2=.ed25519', name: 'dominic2' },
        { link: '@+oaWWDs8g73EZFUMfW37R/ULtFEjwKN/DczvdYihjb2=.ed25519', name: 'christian2' },
        { link: '@gaQw6z30GpfsW9k8V5ED4pHrg8zmrqku24zTSAINhR3=.ed25519', name: 'SoapDog3' } // 8th recp
      ]
    }

    scuttle.gathering.async.publish(opts, (err, gathering) => {
      t.true(err, 'cannot have more than 7 recps')
      t.equal(err[0].field, 'data.recps', 'definitely fails on recps validation')

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
