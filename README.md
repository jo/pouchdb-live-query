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
    // result is extended view query result
    // { total_rows: 3, rows: [{ id: 'mydoc', key: ... }, ...] }
    
    // event emitter
    result.on('change', function(change) {
      // result has been updated
    })

    // stop listening
    result.cance()
  })
```

## `db.liveQuery(fun, [options])`
Similar to [`db.query`](http://pouchdb.com/api.html#query_database).

### Options
* `fun`: The name of a view in an existing design document, e.g. `'mydesigndoc/myview'`.
* `options.include_docs`: Include the document in each row in the doc field. 
* `options.descending`: Reverse the order of the output rows.
* `options.startkey` and `options.endkey`: Return only rows between these.

## Whats Missing
* `callback` - Currently works only with promises.
* `options.key` - Key exact match is ignored on view update.
* `options.reduce` - No reduce support at all.
Just to mention some...

## Tests

```sh
npm test
```
