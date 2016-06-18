var connect = require('./lib/connect');
var util = require('./lib/util')
var listen = require('./lib/listen')
var unixListen = require('./lib/unixListen')

module.exports = {
  listen: function (s, params) {
    if (!params) params = {}
    if (!params.protocols) {
      params.protocols = {
        'ws:': require('./lib/ws/listen'),
        'tcp:': require('./lib/tcp/listen'),
        'udp:': require('./lib/udp/listen')
      }
    }
    if (!params.unixProtocols) {
      params.unixProtocols = {
        'tcp+unix:': require('./lib/tcp/listen'),
        'ws+unix:': require('./lib/ws/listen')
      }
    }
    params.unixConnectProtocols = {
      'tcp+unix:': require('./lib/tcp/connect'),
      'ws+unix:': require('./lib/ws/connect')
    }

    var url = util.parseUrl(s)
    if (params.unixProtocols[url.protocol] != null) return unixListen(s, params);

    return listen(s, params)
  },
  connect: function (s, params, cb) {
    if (util.isFunction(params) && !cb) {
      cb = params
      params = {}
    }

    if (!params.protocols) {
      params.protocols = {
        'tcp:': require('./lib/tcp/connect'),
        'ws:': require('./lib/ws/connect')
      }
    }

    if (!params.unixProtocols) {
      params.unixProtocols = {
        'tcp+unix:': require('./lib/tcp/connect'),
        'ws+unix:': require('./lib/ws/connect')
      }
    }

    return connect(s, params, cb)
  },
  combine: require('./lib/combine'),
  on: require('./lib/on')
}
