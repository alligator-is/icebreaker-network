'use strict'

var Net = require('net')
var pick = require('lodash.pick')
var _ = require('icebreaker')
var util = require('../util')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'path', 'reuseAddr','keepAlive','noDelay','allowHalfOpen','exclusive')

  var notify = _.notify()

  var server = Net.createServer({ allowHalfOpen: true }, function (o) {
    o.setKeepAlive(params.keepAlive || false)
    o.setNoDelay(params.noDelay || true)
    o.allowHalfOpen = params.allowHalfOpen||true
    var c = _.toPull.duplex(o)
    c.type = 'connection'
    c.remoteAddress = o.remoteAddress
    c.remotePort = o.remotePort
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