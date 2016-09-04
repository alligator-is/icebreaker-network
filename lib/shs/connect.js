'use strict'
var SHS = require('secret-handshake')
var util = require('../util')

var _ = typeof icebreaker ==='function'?icebreaker : require('icebreaker')
var cl = require('chloride')

module.exports = function (params, cb) {
  params.protocol = params.protocol || 'shs+tcp:'
    params.encoding  =  params.encoding||'base64' 

  var protocol = params.protocol.substring(params.protocol.indexOf('+') + 1)
  if (!util.isString(params.auth)) throw new Error('public key required')

  var publicKey = util.decode(params.auth,params.encoding)

  protocol = params.protocols[protocol] || params.unixProtocols[protocol]
  protocol(params, function (err, connection) {
    if (err) return cb(err, connection)
    _(connection, SHS.createClient({
      publicKey:util.toBuffer(new Buffer(params.keys.publicKey.toString('base64'),'base64')),
      secretKey:util.toBuffer(new Buffer(params.keys.secretKey,'base64').toString('base64'))},
      new Buffer(cl.crypto_hash_sha256(new Buffer(params.appKey)), 'base64'))(publicKey, function(err, s) {
      if (err) return cb(err)
      cb(null, util.defaults({ appKey: params.appKey }, util.defaults(s, connection)))

    }), connection)
  })
}