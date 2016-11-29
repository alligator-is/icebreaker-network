'use strict'
var util = require('./util')
var defaults = util.defaults
var net = require('net')
var dns = require('dns')
var _ = window.icebreaker||require('icebreaker')

module.exports = function connect(s, params, cb) {
  if (_.isFunction(params) && !cb) {
    cb = params
    params = {}
  }

  var unixProtocols = params.unixProtocols || {}
  
  var protocols = params.protocols || {}

  function isUnixProtocol(url) {
    return unixProtocols[url.protocol] != null
  }

  if (!_.isFunction(cb)) throw new Error('cb is required')

  var url = util.parseUrl(s)

  function connect(address) {
    var c = protocols[url.protocol] || unixProtocols[url.protocol]
    if (!c && !isUnixProtocol(url)) throw new Error('protocol ' + url.protocol + ' not found!')

    c(defaults(isUnixProtocol(url) ? {
      path: url.path, protocol: url.protocol, auth: url.auth,
      appKey: url.appKey,
    } : {
        port: url.port,
        host: address || url.hostname,
        protocol: url.protocol,
        path: url.path == '/' ? null : url.path,
        auth: url.auth,
        appKey: url.appKey,
      }, params), function (err, connection) {

        if (err) return cb(err)

        cb(null, {
          type: 'connection',
          source: connection.source,
          sink: connection.sink,
          auth: connection.auth,
          protocol:url.protocol,
          address: s
        })
      })
  }

  if (isUnixProtocol(url)) return connect()
  
  if (!dns.lookup || !net.isIP) return connect()
  
  if (_.isString(url.hostname) && !net.isIP(url.hostname)) {
    dns.lookup(url.hostname, function (err, address, family) {
      connect(address)
    })
    return
  }

  connect()
}