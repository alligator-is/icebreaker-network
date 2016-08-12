var SHS = require('secret-handshake');
var util = require('../util');

var _ = typeof icebreaker ==='function'?icebreaker : require('icebreaker');
var cl = require('chloride')

module.exports = function (params, cb) {
  params.protocol = params.protocol || 'shs+tcp:'
  var protocol = params.protocol.substring(params.protocol.indexOf('+') + 1)
  if (!util.isString(params.auth)) throw new Error('public key required')
  var publicKey = util.toBuffer(params.auth);
  protocol = params.protocols[protocol] || params.unixProtocols[protocol]

  if (!util.isPlainObject(params.keys) && !util.isString(params.keys.private) && !util.isString(params.keys.public)) throw new Error('private and public keys required')

  protocol(params, function (err, connection) {
    if (err) return cb(err, connection)
    _(connection, SHS.createClient(params.keys, new Buffer(cl.crypto_hash_sha256(new Buffer(params.appKey)), 'base64'))(publicKey, function (err, s) {
      if (err) return cb(err)
      cb(null, util.defaults({ appKey: params.appKey }, util.defaults(s, connection)))

    }), connection)
  })
}