var connect = require('./lib/connect')
var util = require('./lib/util')

module.exports = {
  connect: function (s, params, cb) {
    if (util.isFunction(params) && !cb) {
      cb = params
      params = {}
    }
    if (!params.protocols) params.protocols = {
      'ws:': require('./lib/ws/connect'),
      'wss:': require('./lib/ws/connect'),
      'shs+ws:': require('./lib/shs/connect')
    }
    if (!params.unixProtocols) params.unixProtocols = {}
    return connect(s, params, cb)
  }
}