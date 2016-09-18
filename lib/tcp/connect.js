'use strict'
var Net = require('net')
var pick = require('lodash.pick')
var to = require('stream-to-pull-stream')

module.exports = function (params, cb) {
  var o = Net.createConnection(pick(params, 'host', 'port', 'lookup', 'path'))
  o.setKeepAlive(params.keepAlive || false)
  o.setNoDelay(params.noDelay || true)
  o.allowHalfOpen=true
  
  var handle = function (err) {
    o.removeListener('error', handle)
    o.removeListener('connect', handle)
    if(err) return cb(err)
    var c = to.duplex(o)
    c.type = 'connection'
    if (cb) {
      cb(null,c)
      cb = null
    }
  }

  o.on('error', handle)
  o.on('connect', handle)
}