'use strict'
var _ = require('icebreaker')
var Net = require('net')
var pick = require('lodash.pick')
var to = require('stream-to-pull-stream')
var defaults = require('lodash.defaults')

module.exports = function (params, cb) {
  var o = Net.createConnection(pick(params, 'host', 'port', 'lookup', 'path'))
  o.setKeepAlive(params.keepAlive || false)
  o.setNoDelay(params.noDelay || true)

  var handle = function (err) {
    o.removeListener('error', handle)
    o.removeListener('connect', handle)
    var c = err ? {
      source: _.error(err),
      sink: _.onEnd(function (err) {})
    } : to.duplex(o)
    c = defaults(c, pick(o, ['remoteAddress', 'localAddress', 'remoteFamily', 'localPort', 'remotePort']))
    c = defaults({
      protocol: params.protocol || 'tcp:',
      type: 'connection'
    }, c)
    if (!c.remoteAddress && !c.localAddress) c.localAddress = c.remoteAddress = params.path
    if (cb) {
      cb(c)
      cb = null
    }
  }

  o.on('error', handle)
  o.on('connect', handle)
}
