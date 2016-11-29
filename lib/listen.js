'use strict'
var util = require('./util')
var defaults = util.defaults
var map = require('./map')
var _ = require('icebreaker')
var source = require('pull-defer').source
var net = require('net')
var dns = require('dns')
var Address6 = require('ip-address').Address6
var URL = require('url')

module.exports = function listen(addr, params) {
  var url = util.parseUrl(addr)
  var l = params.protocols[url.protocol]
  if (!l) throw new Error('protocol ' + url.protocol + ' not found!')

  var s
  var d = source()
  var m = map({
    ready: function (e) {
      if (net.isIPv6(e.address) && net.isIPv4(url.hostname)) {
        var address = new Address6(e.address)
        e.address = address.to4().address
      }

      if (e.address != null) {
        url.hostname = e.address
      }

      if (e.port !== null) { url.port = e.port }

      if (e.port != null && e.address != null) {
        delete url.host
        addr = URL.format(url)
      }

      return {
        type: 'ready',
        address: addr
      }
    },
    connection: function (e) {
      e.protocol = url.protocol
      return e
    },
    message: function (e) {
      e.protocol = url.protocol
      return {
        type: 'message',
        data: e.data,
        protocol: url.protocol,
        get remoteAddress() { return util.toRemoteAddress(e, params.encoding) }
      }
    }
  })

  function resolve(address) {
    d.resolve(
      s = l(defaults({
        port: url.port,
        host: url.hostname = address || url.hostname,
        protocol: url.protocol,
        auth: url.auth,
        path: url.path,
        appKey: url.appKey
      }, params))
    )

    n.type = s.type
    n.protocol = url.protocol

    if (_.isFunction(s.push))
      n.push = function (msg, port, addr) {
        if (addr == null && port != null && _.isString(port)) {
          var parsed = util.parseUrl(port)
          return s.push(msg, parsed.port, parsed.hostname)
        }
        s.push(msg, port, addr)
      }
  }

  var n = _(d, m)

  n.end = function () {
    if (s) s.end.apply([].slice.call(arguments))
  }

  if (_.isString(url.hostname) && !net.isIP(url.hostname)) {
    dns.lookup(url.hostname, function (err, address, family) {
      if (err) return d.resolve(_.error(err))
      resolve(address)
    })
    return n
  }

  resolve()

  return n
}