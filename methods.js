module.exports = {
  gathering: {
    async: {
      get: require('./gathering/async/get'),
      publish: require('./gathering/async/publish')
    }
  },
  update: {
    async: {
      publish: require('./update/async/publish')
    }
  },
  attendee: {
    async: {
      publish: require('./attendee/async/publish')
    }
  }
}
