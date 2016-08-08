'use strict'
var Notify = require('pull-pushable'),
  utp = require('utp-native'),
  pick = require('lodash.pick'),
  to = require('stream-to-pull-stream'),
  util = require('../util')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'protocol')

  var notify = new Notify(function (err) { })
  var socket = utp()

  socket.on('message', function (msg, rinfo) {
    var addr = socket.address()
    notify.push({
      type: 'message',
      data: msg,
      protocol: source.protocol,
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    })
  })

  socket.on('connection', function (o) {
    var c = to.duplex(o)
    c.type = 'connection'
    notify.push(c)
  })

  socket.once('error', function (err) {
    err.type = "error"
    socket.once('close', function () {
      notify.end(err)
    })
    socket.close()
  })

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }
  source.protocol = params.protocol || 'utp:'
  source.push = function (buf, port, host) {
    if (util.isString(buf)) buf = new Buffer(buf, 'utf8')
    if (util.isString(port)) port = parseInt(port)
    socket.send(buf, 0, buf.length, port, host)
  }

  source.end = function () {
    socket.once('close', function () {
      notify.end(true)
    })
    socket.close()
  }

  socket.listen(params.port, params.host, function () {
    notify.push({type: 'ready'})
  })

  return source
}