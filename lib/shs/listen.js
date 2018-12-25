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
  
  var auth = function(id,cb){
    if(id) id  = util.encode(util.decode(id,"base64"),params.encoding)
    params.authenticate(id,cb)
  }
   
  var create = SHS.createServer({
    publicKey: util.decode(util.encode(util.decode(params.keys.publicKey||params.auth, params.encoding), 'base64'), 'base64'),
    secretKey: util.decode(util.encode(util.decode(params.keys.secretKey, params.encoding), 'base64'), 'base64') },
    auth, Buffer.from(cl.crypto_hash_sha256(Buffer.from(params.appKey)), 'base64'),
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
          if(s && s.remote)s.remote  = util.encode(util.decode(s.remote,"base64"),params.encoding)

          if (err) return cb({source: _.error(err),sink: function (read) { read(err, function () { }) }})
          cb(util.defaults({ appKey: params.appKey }, util.defaults(s, c)))
        }), c)
      }
    })
  )

  source.protocol = params.protocol
  source.end = protocol.end

  return source
}