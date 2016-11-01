'use strict'

var Net = require('net')
var pick = require('lodash.pick')
var to = require('stream-to-pull-stream')
var util = require('../util')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'path', 'reuseAddr','keepAlive','noDelay','allowHalfOpen')

  var notify = util.createNotify()

  var server = Net.createServer({ allowHalfOpen: true }, function (o) {
    o.setKeepAlive(params.keepAlive || false)
    o.setNoDelay(params.noDelay || true)
    o.allowHalfOpen = params.allowHalfOpen||true
    var c = to.duplex(o)
    c.type = 'connection'
    notify(c)
  })

  server.once('error', function (err) {
    err.type = "error"
    try {
      server.close(function () {
        notify.end(err)
      })
    } catch (e) {

      notify.end(err)
    }
  })

  var source = notify.listen()

  source.end = function (err) {
    try {
      server.close(function () {
        notify.end(err)
      })
    } catch (e) {
      notify.end(e)
    }
  }

  server.listen(params, function () {
    notify({ type: 'ready', address: server.address().address, port: server.address().port })
  })

  return source
}