# PouchDB Live Query Plugin
Provide a view which keeps itself up to date by listening to the changes feed.

[![Build Status](https://travis-ci.org/jo/pouchdb-live-query.svg?branch=master)](https://travis-ci.org/jo/pouchdb-live-query)

**:warning: Very alpha.**

## Installation
pouchdb-live-query is [hosted on npm](https://www.npmjs.com/package/pouchdb-live-query).

### Node
Install via `npm install pouchdb-live-query` 

```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-live-query'))
```

### Browser
Use the [browserified build](./dist/pouchdb-live-query.js).

```html
<script src="pouchdb.js"></script>
<script src="pouchdb-live-query.js"></script>
```


## Usage
```js
var db = new PouchDB('mydb')

db.liveQuery('my/view')
  .then(function(result) {
    // result is an extended view query result
    result.on('change', function() {
      // result has been updated
    })
  })
```

## Tests

```sh
npm test
```
