'use strict'

var Net = require('net')
var pick = require('lodash.pick')
var url = require('url')
var util = require('../util')
var connect = require('pull-ws/client')

module.exports = function (params, cb) {
  params = pick(params, 'host', 'port', 'path', 'protocol')
  var address = {
    protocol: params.protocol,
    port: params.port,
    pathname: params.path,
    slashes: true
  }
  if (params.path == null) {
    address.hostname = params.host
    address.port = params.port
  } else {
    address = 'ws+unix://' + params.path
  }

  var c = connect(url.format(address), function (err) {
    if (err) return cb(err)
    c.type = 'connection'
    if (cb) {
      cb(null, c)
      cb = null
    }
  })
}