'use strict'
var utp = require('utp-native')
var pick = require('lodash.pick')
var _ = require('icebreaker')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'protocol')

  var notify = _.notify()
  var socket = utp()

  socket.on('message', function (msg, rinfo) {
    var addr = socket.address()
    notify({
      type: 'message',
      data: msg,
      protocol: source.protocol,
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    })
  })

  socket.on('connection', function (o) {
    var c = _.toPull.duplex(o)
    c.type = 'connection'
    c.remoteAddress = o.remoteAddress
    c.remotePort = o.remotePort
    notify(c)
  })

  socket.once('error', function (err) {
    err.type = "error"
    socket.once('close', function () {
      notify.end(err)
    })
    socket.close()
  })

  var source = notify.listen()

  source.protocol = params.protocol || 'utp:'

  source.push = function (buf, port, host) {
    if (_.isString(buf)) buf = new Buffer(buf, 'utf8')
    if (_.isString(port)) port = parseInt(port)
    socket.send(buf, 0, buf.length, port, host)
  }

  source.end = function (err) {
    socket.once('close', function () {
      notify.end(err)
    })
    socket.close()
  }

  socket.listen(params.port, params.host, function () {
    notify({ type: 'ready', address: socket.address().address, port: socket.address().port })
  })

  return source
}