var Connect = require('./lib/connect')
var util = require('./lib/util')
var Listen = require('./lib/listen')
var unixListen = require('./lib/unixListen')
var defaults = require('lodash.defaults')
var utp
var isFunction = require('icebreaker/util/isFunction')
try {
  utp = require('utp-native')
}
catch (err) {
}

var listen = {
  protocols: {
    'ws:': require('./lib/ws/listen'),
    'tcp:': require('./lib/tcp/listen'),
    'udp:': require('./lib/udp/listen'),
    'shs+tcp:': require('./lib/shs/listen'),
    'shs+ws:': require('./lib/shs/listen')
  }
}
if (utp){
  listen.protocols['utp:']= require('./lib/utp/listen')
  listen.protocols['shs+utp:']=require('./lib/shs/listen')
}

listen.unixProtocols = {
  'tcp+unix:': require('./lib/tcp/listen'),
  'ws+unix:': require('./lib/ws/listen'),
  'shs+ws+unix:': require('./lib/shs/listen'),
  'shs+tcp+unix:': require('./lib/shs/listen')
}

var connect = {}
connect.protocols = {
  'tcp:': require('./lib/tcp/connect'),
  'ws:': require('./lib/ws/connect'),
  'wss:': require('./lib/ws/connect'),
  'shs+tcp:': require('./lib/shs/connect'),
  'shs+ws:': require('./lib/shs/connect'),
}

if (utp){
  connect.protocols['utp:'] = require('./lib/utp/connect')
  connect.protocols['shs+utp:'] = require('./lib/shs/connect')
}

connect.unixProtocols = {
  'tcp+unix:': require('./lib/tcp/connect'),
  'ws+unix:': require('./lib/ws/connect'),
  'shs+ws+unix:': require('./lib/shs/connect'),
  'shs+tcp+unix:': require('./lib/shs/connect')
}

module.exports = {
  protoNames: function () {
    var ary = []
    Object.keys(listen).forEach(function (k) {
      [].concat(Object.keys(connect[k]), Object.keys(listen[k])).forEach(function (i) {
        if (ary.indexOf(i) === -1) ary.push(i)
      })
    })
    return ary
  },
  register: function (name, _connect, _listen) {
    if (name.indexOf('+unix') !== -1) {
      if (_connect != null) connect.unixProtocols[name] = _connect
      if (_listen != null) listen.unixProtocols[name] = _listen
      return
    }
    if (_connect != null) connect.protocols[name] = _connect
    if (_listen != null) listen.protocols[name] = _listen
  },
  listen: function (s, params) {
    if (!params) params = {}
    params.protocols = listen.protocols
    params.unixProtocols = listen.unixProtocols
    params.unixConnectProtocols = connect.unixProtocols
    var url = util.parseUrl(s)
    if (params.unixProtocols[url.protocol] != null) return unixListen(s, params)

    return Listen(s, params)
  },
  connect: function (s, params, cb) {
    if (isFunction(params) && !cb) {
      cb = params
      params = {}
    }

    params.protocols = connect.protocols
    params.unixProtocols = connect.unixProtocols
    return Connect(s, params, cb)
  },
  combine: require('./lib/combine'),
  on: require('./lib/on'),
  map: require('./lib/map'),
  asyncMap: require('./lib/asyncMap')
}
