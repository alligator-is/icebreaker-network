'use strict'
var utp = require('utp-native')
var pick = require('lodash.pick')
var to = require('stream-to-pull-stream')

module.exports = function (params, cb) {
  params =pick(params, 'host', 'port')

  var o = utp.connect(params.port,params.host)
  
  var handle = function (err) {
    o.removeListener('error', handle)
    o.removeListener('connect', handle)
    if(err) return cb(err)
 
    var c = to.duplex(o)
    c.type = 'connection'

    if (cb) {
      cb(null,c)
      cb = null
    }
  }

  o.on('error', handle)
  o.on('connect', handle)
}
