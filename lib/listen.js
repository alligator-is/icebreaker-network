'use strict'
var util = require('./util')
var defaults = util.defaults
var map = require('./map')
var _ = require('icebreaker')
var source = require('pull-defer').source
var net = require('net')
var dns = require('dns')

module.exports = function listen(addr, params) {
  var url = util.parseUrl(addr)
  var l = params.protocols[url.protocol]
  if (!l) throw new Error('protocol ' + url.protocol + ' not found!')

  var s
  var d = source()
  var localAddress
  var localPort
  
  function resolve(address) {
    d.resolve(s = l(defaults({
      port: localPort = url.port,
      host: localAddress = address || url.hostname,
      protocol: url.protocol,
      auth: url.auth,
      path: url.path,
      appKey: url.appKey,
    }, params)))
    n.type = s.type
    n.protocol = url.protocol
    if (util.isFunction(s.push))
      n.push = function (msg, port, addr) {
        if (addr == null && port != null && util.isString(port)) {
          var parsed = util.parseUrl(port)
          return s.push(msg, parsed.port, parsed.hostname)
        }
        s.push(msg, port, addr)
      }
  }

  var n = _(d, map({
    ready: function (e) {
      return {
        type: 'ready',
        address:addr,
      }
    },
    message: function (e) {
      e.protocol = url.protocol
      return {
        type: 'message',
        data: e.data,
        get remoteAddress(){ return util.toRemoteAddress(e) }
      }
    }
  }))

  n.end = function () {
    if (s) s.end.apply([].slice.call(arguments))
  }

  if (util.isString(url.hostname) && !net.isIP(url.hostname)) {
    dns.lookup(url.hostname, function (err, address, family) {
      if (err) return d.resolve(_.error(err))
      resolve(address);
    })
    return n
  }
  resolve();
  return n;
}