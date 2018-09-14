module.exports = {
  gathering: {
    async: {
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
