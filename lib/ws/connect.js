'use strict'
var pick = require('lodash.pick')
var url = require('url')
var connect = require('pull-ws/client')
var util = require('../util')

module.exports = function (params, cb) {
  params = pick(params, 'host', 'port', 'path', 'protocol')
  var address = {
    protocol: params.protocol,
    port: params.port,
    pathname: params.path,
    slashes: true
  }
  if (params.path == null) {
    if(util.isWindows()){
      if(params.host ==='0.0.0.0')params.host='localhost'
      if(params.host ==='::')params.host='localhost'
    }
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