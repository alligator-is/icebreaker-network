'use strict'
var URL = require('url')
var os = require('os')
var path = require('path')
var cl = require('chloride')
var isIPv6 = require('net').isIPv6

var util = module.exports = {

  isFunction: function (f) {
    return 'function' === typeof f
  },

  isString: function (s) {
    return typeof s === 'string'
  },

  isPlainObject: function (o) {
    return o && 'object' === typeof o && !Array.isArray(o)
  },

  defaults: require('lodash.defaults'),

  toBuffer: function (base64) {
    if (Buffer.isBuffer(base64)) return base64
    return new Buffer(base64, 'base64')
  },

  isEmpty: function (obj) {
    if (obj == null) return true
    for (var key in obj)
      if (obj.hasOwnProperty(key)) return false
    return true
  },

  isWindows: function () {
    return os != null ? os.platform() === 'win32' : false
  },

  toLocalAddress: function (e) {
    var addr = e.protocol + '//'
    if (Buffer.isBuffer(e.remote)) addr += encodeURIComponent(e.remote.toString('base64')) + '@'
    addr += isIPv6(e.localAddress) ? '[' + e.localAddress + ']' : e.localAddress
    if (e.localPort != null) addr += ':' + e.localPort
    if (e.appKey != null) addr += '/' + e.appKey
    return addr
  },

  toRemoteAddress: function (e) {
    var addr = e.protocol + '//'
    if (Buffer.isBuffer(e.remote)) addr += encodeURIComponent(e.remote.toString('base64')) + '@'
    addr += isIPv6(e.remoteAddress) ? '[' + e.remoteAddress + ']' : e.remoteAddress
    if (e.remotePort != null) addr += ':' + e.remotePort
    if (e.appKey != null) addr += '/' + e.appKey
    return addr
  },

  parseUrl: function (s, d) {
    if (s.trim().indexOf('://') == -1) {
      s = d + '//' || 'tcp://' + s
    }
    var url = URL.parse(s, true, true)
    for (var k in url.query) {
      if (url.query[k] === 'true') {
        url.query[k] = true
      }
      if (url.query[k] === 'false') {
        url.query[k] = false
      }
    }

    var isWindows = util.isWindows;

    if (url.protocol.indexOf('+unix') !== -1) {
      if (isWindows()) {
        var p = path.parse(url.path).root;
        if (p !== '//./pipe/')
          url.path = path.join('\\\\.\\pipe', url.path);
      }
    }

    if (util.isString(url.port)) url.port = parseInt(url.port)

    if (url.protocol.indexOf('shs+') !== -1) {
      if (url.path == null || url.path.length === 1) throw new Error('appKey is required')

      url.appKey = url.path.slice(1)
      url.path = '/';
    }

    return url
  }
}