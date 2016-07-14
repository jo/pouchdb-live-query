var EE = require('events').EventEmitter
var inherit = require('inherits')
var pouchCollate = require('pouchdb-collate')
var collate = pouchCollate.collate
var normalizeKey = pouchCollate.normalizeKey
var evalFunc = require('./lib/evalfunc')
var quickInsert = require('quick-insert')


inherit(LiveQuery, EE)

function LiveQuery(db, fun, map, options, result) {
  var self = this

  EE.call(this)

  for (var property in result) {
    this[property] = result[property]
  }

  if (typeof options.endkey === 'undefined') {
    options.endkey = {}
  }

  var mapResults
  var doc
  function emit(key, value) {
    var output = {
      id: doc._id,
      key: normalizeKey(key)
    }
    
    if (typeof value !== 'undefined' && value !== null) {
      output.value = normalizeKey(value)
    }
    
    if (options.include_docs) {
      output.doc = doc
    }

    mapResults.push(output)
  }

  var sum
  var log = console.log
  var mapFun = evalFunc(map.toString(), emit, sum, log, Array.isArray, JSON.parse)

  var sortFun = function(a, b) {
    return options.descending ? collate(b.key, a.key) : collate(a.key, b.key)
  }

  var insertRow = function(row) {
    quickInsert(row, self.rows, sortFun)

    if (collate(options.startkey, self.rows[0].key) > 0) {
      self.rows.shift()
    }
    if (collate(self.rows[self.rows.length - 1].key, options.endkey) > 0) {
      self.rows.pop()
    }
  }

  var changesOptions = {
    include_docs: true,
    live: true,
    since: 'now',
    filter: '_view',
    view: fun
  }

  var changes = db.changes(changesOptions)

  changes.on('change', function(change) {
    var count = 0

    for (var i = 0; i < self.rows.length; i++) {
      if (self.rows[i].id === change.id) {
        count++
        self.rows.splice(i, 1)
      }
    }
    self.total_rows -= count
    
    if (!change.deleted && change.doc) {
      doc = change.doc
      mapResults = []

      mapFun(change.doc)

      self.total_rows += mapResults.length

      mapResults.forEach(insertRow)
    }

    self.emit('change', change)
  })
  
  this.cancel = changes.cancel.bind(changes)
}

function getMapFun(db, map) {
  if (typeof map === 'function') return Promise.resolve(map)

  var parts = map.split('/')
  var name = parts[0]
  var fun = parts[1]

  return db.get('_design/' + name)
    .then(function(ddoc) {
      return ddoc.views[fun].map
    })
}

exports.liveQuery = function(fun, options) {
  var db = this

  options = options || {}

  return getMapFun(db, fun)
    .then(function(mapFun) {
      return db.query(fun, options)
        .then(function(result) {
          return new LiveQuery(db, fun, mapFun, options, result)
        })
    })
}

if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(module.exports)
}
