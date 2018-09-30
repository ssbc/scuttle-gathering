# scuttle-gathering

Returns a set of functions as an API for validating, building, publishing and reading records related to gatherings

## Usage

```js
var Scuttle = require('scuttle-gathering')
var scuttle = Scuttle(server) // a scuttlebutt server or connection to one

scuttle.get(gatheringKey, (err, niceDataObject) => { ... })
```

## API Methods

### `scuttle.post(opts, cb)`

alias of:  `scuttle.gathering.async.publish`

`opts` : an Object of form (`title` and `startDateTime` are the only required properties)

```js
{
  title: String,
  startDateTime: {
    epoch: UnixTime,
    tz: String           // tz is optional
  },
  progenitor: MessageId, // optional
  description: String,   // optional
  location: String,      // optional
  image: {               // optional
    link: Blob,
    name: String,        // name, size, type are optional
    size: Integer,
    type: MimeTypeString
  }
}
```

`cb` : a callback of signature `(err, data)`


### `scuttle.put(gatheringKey, opts, cb)`

alias of `scuttle.update.async.publish`

`gatheringKey` is a messageId for your gathering
`opts` is an Object of any of the gathering details you'd like to update (title, startDateTime, description, location, image, etc in the appropriate formats)

`cb` : a callback of signature `(err, data)`


### `scuttle.attending(gatheringKey, isAttending, cb)`

alias of `scuttle.attendee.async.publish`

Publishes a message updating whether or not you're attending the gathering.

`gatheringKey` is a messageId for your gathering
`isAttending` is a Boolean
`cb` : a callback of signature `(err, data)`

NOTE - can also be called `scuttle.attendee(key, cb)` which is the same as saying `isAttending` true

### `scuttle.get(gatheringKey, cb)`

alias of `scuttle.gathering.async.get`

Gets a 'document' - a reduced state of the 'gathering as a whole' of the form:

```js
{
  key: MessageId,
  title: String,
  startDateTime: {
    epoch: UnixTime,
    tz: String                 // *
  },
  progenitor: MessageId,
  description: String,
  location: String,
  image: {
    link: Blob,
    name: String,             // *
    size: Integer,            // *
    type: MimeTypeString      // *
  },
  images: [ Image, Image, ... ] // Objects of same form as image property
  isAttendee: Boolean,
  attendees: [ FeedId, FeedId, ... ],
  heads: [ MessageId, .... ], // most recent message(s) in the document/ thread
  threads: [ MessageId, ... ] // all backlinks in causal order
}
```

Strings that haven't been set will be empty strings, sub-properties marked with `*` are optional and may not be present.


## License

AGPL-3.0
