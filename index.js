var connect = require('./lib/connect')
var util = require('./lib/util')
var listen = require('./lib/listen')
var unixListen = require('./lib/unixListen')
var defaults = require('lodash.defaults')
var utp
try {
  utp = require('utp-native')
}
catch (err) {
}

module.exports = {
  listen: function (s, params) {
    if (!params) params = {}
    params.protocols = defaults(params.protocols || {}, {
      'ws:': require('./lib/ws/listen'),
      'tcp:': require('./lib/tcp/listen'),
      'udp:': require('./lib/udp/listen'),
      'shs+tcp:': require('./lib/shs/listen'),
      'shs+ws:': require('./lib/shs/listen')
    })
    if (utp)
      params.protocols = defaults(params.protocols || {}, {
        'utp:': require('./lib/utp/listen'),
        'shs+utp:': require('./lib/shs/listen')
      })

    params.unixProtocols = defaults(params.unixProtocols || {}, {
      'tcp+unix:': require('./lib/tcp/listen'),
      'ws+unix:': require('./lib/ws/listen'),
      'shs+ws+unix:': require('./lib/shs/listen'),
      'shs+tcp+unix:': require('./lib/shs/listen')
    }
    )

    params.unixConnectProtocols = defaults(params.unixProtocols || {}, {
      'tcp+unix:': require('./lib/tcp/connect'),
      'ws+unix:': require('./lib/ws/connect'),
      'shs+ws+unix:': require('./lib/shs/connect'),
      'shs+tcp+unix:': require('./lib/shs/connect')
    })

    var url = util.parseUrl(s)
    if (params.unixProtocols[url.protocol] != null) return unixListen(s, params)

    return listen(s, params)
  },
  connect: function (s, params, cb) {
    if (util.isFunction(params) && !cb) {
      cb = params
      params = {}
    }

    params.protocols = defaults(params.protocols || {}, {
      'tcp:': require('./lib/tcp/connect'),
      'ws:': require('./lib/ws/connect'),
      'wss:': require('./lib/ws/connect'),
      'shs+tcp:': require('./lib/shs/connect'),
      'shs+ws:': require('./lib/shs/connect'),
    })

    if (utp)
      params.protocols = defaults(params.protocols || {}, {
        'utp:': require('./lib/utp/connect'),
        'shs+utp:': require('./lib/shs/connect')
      })

    params.unixProtocols = defaults(params.unixProtocols || {}, {
      'tcp+unix:': require('./lib/tcp/connect'),
      'ws+unix:': require('./lib/ws/connect'),
      'shs+ws+unix:': require('./lib/shs/connect'),
      'shs+tcp+unix:': require('./lib/shs/connect')
    })

    return connect(s, params, cb)
  },
  combine: require('./lib/combine'),
  on: require('./lib/on'),
  map: require('./lib/map'),
  asyncMap: require('./lib/asyncMap')
}
