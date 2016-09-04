'use strict'

var Notify = require('pull-pushable'),
  Net = require('net'),
  pick = require('lodash.pick'),
  to = require('stream-to-pull-stream')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'path','reuseAddr')

  var notify = new Notify(function (err) { })

  var server = Net.createServer(function (o) {
    o.setKeepAlive(params.keepAlive || false)
    o.setNoDelay(params.noDelay || true)

    var c = to.duplex(o)
    c.type = 'connection'
    notify.push(c)
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

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }

  source.end = function () {
    try {
      server.close(function () {
        notify.end(true)
      })
    } catch (e) {
      notify.end(e)
    }
  }

  server.listen(params, function () { notify.push({ type: 'ready' }) })

  return source
}