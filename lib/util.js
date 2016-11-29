'use strict'
var URL = require('url')
var os = require('os')
var path = require('path')
var cl = require('chloride')
var isIPv6 = require('net').isIPv6
var bs58 = require('bs58')

var _ = window.icebreaker||require('icebreaker')

var util = module.exports = {

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
    return os != null && os.platform != null ? os.platform() === 'win32' : false
  },

  encode: function (buf, encoding) {
    if(typeof buf ==="string")return buf
    if (encoding === 'base58') return bs58.encode(buf)
    return buf.toString(encoding)
  },

  decode: function (s, encoding) {
    if(Buffer.isBuffer(s)) return s
    if (encoding === 'base58') return new Buffer(bs58.decode(s))
    return new Buffer(s, encoding)
  },
  toRemoteAddress: function (e, encoding) {
    var addr = e.protocol + '//'
    if (Buffer.isBuffer(e.remote)) addr += encodeURIComponent(util.encode(e.remote, encoding || 'base64')) + '@'
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

    if (_.isString(url.port)) url.port = parseInt(url.port)

    if (url.protocol.indexOf('shs+') !== -1) {
      if (url.path == null || url.path.length === 1) throw new Error('appKey is required')
      url.appKey = path.parse(url.path).base
      url.path = path.parse(url.path).dir;
    }

    return url
  }
}