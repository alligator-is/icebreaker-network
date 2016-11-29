'use strict'
var _ = require('icebreaker')
var asyncMap = require('../asyncMap')
var util = require('../util')
var cl = require('chloride')
var SHS = require('secret-handshake')

module.exports = function listen(params) {
  params.encoding = params.encoding || 'base64'
  params.protocol = params.protocol || 'shs+tcp:'

  var protocol = params.protocol.substring(params.protocol.indexOf('+') + 1)
  protocol = params.protocols[protocol] || params.unixProtocols[protocol]

  if (!_.isFunction(params.authenticate)) throw new Error('authenticate function required')

  var create = SHS.createServer({
    publicKey: util.decode(util.encode(util.decode(params.keys.publicKey, params.encoding), 'base64'), 'base64'),
    secretKey: util.decode(util.encode(util.decode(params.keys.secretKey, params.encoding), 'base64'), 'base64') },
    params.authenticate, new Buffer(cl.crypto_hash_sha256(new Buffer(params.appKey)), 'base64'),
    params.timeout )

  var source = _(
    protocol = protocol(params),
    asyncMap({
      ready: function (e, cb) {
        e.appKey = params.appKey
        cb(e)
      },
      connection: function (c, cb) {
        _(c, create(function (err, s) {
          if (err) {
            c.source = _.error(err)
            c.sink = function (read) { read(err, function () { }) }
            cb(c)
            return
          }
          cb(util.defaults({ appKey: params.appKey }, util.defaults(s, c)))
        }), c)
      }
    })
  )

  source.protocol = params.protocol
  source.end = protocol.end

  return source
}