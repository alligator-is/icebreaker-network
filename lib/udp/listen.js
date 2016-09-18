'use strict'

var createSocket = require('datagram-stream'),
  util = require('../util')

module.exports = function (params) {
  var notify = util.createNotify()
  var o = createSocket({ address: params.host || params.localAddress, port: params.port, loopback: params.loopback, reuseAddr: params.reuseAddr, multicast: params.multicast, unicast: params.unicast, broadcast: params.broadcast, multicastTTL: params.multicastTTL, bindingPort: params.localPort })

  o.on('data', function (msg) {
    var rinfo = msg.rinfo
    delete msg.rinfo
    var addr = o.address()
    notify({
      type: 'message',
      data: msg,
      remoteAddress: rinfo.address,
      remotePort: rinfo.port,
    })
  })

  o.once('close', function () {
    notify.end(true)
  })

  o.once('error', function (err) {
    err.type = "error"
    notify.end(err)
    try {
      o.close()
    }
    catch (e) { }
  })

  o.once('listening', function () {
    notify({ type: 'ready', protocol: source.protocol })
  })

  var source = notify.listen()

  source.protocol = params.protocol || 'udp:'
  source.end = function () {
    try {
      o.close()
    }
    catch (e) {
      notify.end(e)
    }
  }

  source.push = function (buf, port, host) {
    if (port == null && host == null) return o.write(buf)
    if (util.isString(buf)) buf = new Buffer(buf, 'utf8');
    o.send(buf, 0, buf.length, port, host)
  }

  return source
}