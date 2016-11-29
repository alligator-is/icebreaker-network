var Connect = require('./lib/connect')
var isFunction = window.icebreaker||require('icebreaker').isFunction


var connect = {}
connect.protocols = {
  'ws:': require('./lib/ws/connect'),
  'wss:': require('./lib/ws/connect'),
  'shs+ws:': require('./lib/shs/connect')
}

module.exports = {
  protoNames: function () {
    var ary = []
    Object.keys(connect).forEach(function (k) {
      Object.keys(connect[k]).forEach(function (i) {
        if (ary.indexOf(i) === -1) ary.push(i)
      })
    })
    return ary
  },
  register: function (name, _connect) {
    if (_connect != null) connect.protocols[name] = _connect
  },
  connect: function (s, params, cb) {
    if (isFunction(params) && !cb) {
      cb = params
      params = {}
    }
    params.protocols = connect.protocols
    params.unixProtocols = {}
    return Connect(s, params, cb)
  }
}