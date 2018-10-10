'use strict'
var _ = require('../icebreaker')
var SHS = require('secret-handshake')
var util = require('../util')
var cl = require('chloride')

module.exports = function (params, cb) {
  params.protocol = params.protocol || 'shs+tcp:'
  params.encoding = params.encoding || 'base64'
  if (!_.isString(params.auth)) throw new Error('public key required')

  var publicKey = util.decode(params.auth, params.encoding)
  var protocol = params.protocol.substring(params.protocol.indexOf('+') + 1)
  
  protocol = params.protocols[protocol] || params.unixProtocols[protocol]
  
  protocol( params, function (err, connection) {
    if (err) return cb(err, connection)

    _(
      connection,
      SHS.createClient({
        publicKey: util.decode(util.encode(util.decode(params.keys.publicKey, params.encoding), 'base64'), 'base64'),
        secretKey: util.decode(util.encode(util.decode(params.keys.secretKey, params.encoding), 'base64'), 'base64')
      },
      Buffer.from(cl.crypto_hash_sha256(Buffer.from(params.appKey)), 'base64'))(publicKey, function (err, s) {
        if (err) return cb(err)
      
        cb(null, util.defaults({ appKey: params.appKey }, util.defaults(s, connection)))
      }),
      connection
    )

  })

}