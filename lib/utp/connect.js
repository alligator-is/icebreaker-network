'use strict'
var _ = require('icebreaker')
var utp = require('utp-native')
var pick = require('lodash.pick')
var to = require('stream-to-pull-stream')
var defaults = require('lodash.defaults')

module.exports = function (params, cb) {
  var o = utp.connect(pick(params, 'host', 'port', 'lookup', 'path'))

  var c = to.duplex(o)

  c = defaults(c, pick(o, ['remoteAddress', 'localAddress', 'remoteFamily', 'localPort', 'remotePort']))
  c = defaults({
    protocol: params.protocol || 'utp:',
    type: 'connection'
  }, c)
  if (!c.remoteAddress && !c.localAddress) c.localAddress = c.remoteAddress = params.path
  cb(c)
}
