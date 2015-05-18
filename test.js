var tape = require('tape')
var PouchDB = require('pouchdb')
var memdown = require('memdown')
PouchDB.plugin(require('./'))

var test = function(name, fun) {
  var db = new PouchDB('test-' + name, { db: memdown })

  tape(name, function(t) {
    fun(db, t)
  })
}

var ddoc = {
  _id: '_design/bar',
  views: {
    foos: {
      map: function(doc) {
        emit(doc.foo, doc.n)
      }.toString()
    }
  }
}
var docs = [
  { _id: 'one',   foo: 'aaa', n: 1 },
  { _id: 'two',   foo: 'bbb', n: 2 },
  { _id: 'three', foo: 'ccc', n: 3 }
]

test('insert', function(db, t) {
  db.bulkDocs({
      docs: docs.concat(ddoc)
    })
    .then(function() {
      return db.liveQuery('bar/foos')
    })
    .then(function(result) {
      t.equals(result.total_rows, 3, 'correct # total rows')
      t.deepEqual(result.rows, [
        { id: 'one',   key: 'aaa', value: 1 },
        { id: 'two',   key: 'bbb', value: 2 },
        { id: 'three', key: 'ccc', value: 3 }
      ], 'result.rows is correct')

      result.on('change', function(change) {
        t.equals(result.total_rows, 4, 'correct # total rows')
        t.deepEqual(result.rows, [
          { id: 'one',   key: 'aaa', value: 1 },
          { id: 'four',  key: 'ab', value: 4 },
          { id: 'two',   key: 'bbb', value: 2 },
          { id: 'three', key: 'ccc', value: 3 },
        ], 'result.rows is correct')
        t.end()
      })
    })
    .then(function() {
      db.put({ _id: 'four', foo: 'ab', n: 4 })
    })
    .catch(function(e) {
      console.error(e)
      console.error(e.stack)
    })
})

test('update', function(db, t) {
  db.bulkDocs({
      docs: docs.concat(ddoc)
    })
    .then(function() {
      return db.liveQuery('bar/foos')
    })
    .then(function(result) {
      t.equals(result.total_rows, 3, 'correct # total rows')
      t.deepEqual(result.rows, [
        { id: 'one',   key: 'aaa', value: 1 },
        { id: 'two',   key: 'bbb', value: 2 },
        { id: 'three', key: 'ccc', value: 3 }
      ], 'result.rows is correct')

      result.on('change', function(change) {
        t.equals(result.total_rows, 3, 'correct # total rows')
        t.deepEqual(result.rows, [
          { id: 'two',   key: 'bbb', value: 2 },
          { id: 'three', key: 'ccc', value: 3 },
          { id: 'one',   key: 'zzz', value: 1 },
        ], 'result.rows is correct')
        t.end()
      })
    })
    .then(function() {
      return db.get('one')
    })
    .then(function(doc) {
      doc.foo = 'zzz'
      return db.put(doc)
    })
})

test('delete', function(db, t) {
  db.bulkDocs({
      docs: docs.concat(ddoc)
    })
    .then(function() {
      return db.liveQuery('bar/foos')
    })
    .then(function(result) {
      t.equals(result.total_rows, 3, 'correct # total rows')
      t.deepEqual(result.rows, [
        { id: 'one',   key: 'aaa', value: 1 },
        { id: 'two',   key: 'bbb', value: 2 },
        { id: 'three', key: 'ccc', value: 3 }
      ], 'result.rows is correct')

      result.on('change', function(change) {
        t.equals(result.total_rows, 2, 'correct # total rows')
        t.deepEqual(result.rows, [
          { id: 'two',   key: 'bbb', value: 2 },
          { id: 'three', key: 'ccc', value: 3 }
        ], 'result.rows is correct')
        t.end()
      })
    })
    .then(function() {
      return db.get('one')
    })
    .then(function(doc) {
      return db.remove(doc._id, doc._rev)
    })
})
