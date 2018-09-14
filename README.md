# scuttle-gathering

Returns a set of functions as an API for validating, building, publishing and reading records related to gatherings

## Instantiate

```js
var Scuttle = require('scuttle-gathering')
var scuttle = Scuttle(server) // a scuttlebutt server or connection to one
```

## API Methods

### `scuttle.gathering.async.publish(opts, cb)`

`opts` : an Object of form (`title` and `startDateTime` are the only required properties)

```js
{
  title: String,
  startDateTime: {
    epoch: UnixTime,
    tz: String           // tz is optional
  },
  description: String,   // optional
  location: String,      // optional
  image: {               // optional
    link: Blob,
    name: String,        // name, size type are optional
    size: Integer,
    type: MimeTypeString
  }
}
```

`cb` : a callback of signature `(err, data)`


### `scuttle.update.async.publish(gatheringKey, opts, cb)`

`gatheringKey` is a messageId for your gathering
`opts` is an Object of any of the gathering details you'd like to update (title, startDateTime, description, location, image, etc in the appropriate formats)

`cb` : a callback of signature `(err, data)`


### `scuttle.attendee.async.publish(gatheringKey, isAttending, cb)`

Publishes a message updating whether or not you're attending the gathering.

`gatheringKey` is a messageId for your gathering
`isAttending` is a Boolean
`cb` : a callback of signature `(err, data)`

NOTE - can also be called `scuttle.attendee.async.publish(key, cb)` which is the same as saying `isAttending` true

## License

AGPL-3.0
