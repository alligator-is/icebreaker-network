'use strict'
var _ = require('icebreaker')
var util = require('./util')
var defaults = require('lodash.defaults')
var on = require('./on')
var connect = require('./connect')
var fs = require('fs')
var map = require('./map')
var Notify = require('pull-pushable')

module.exports = function unixListen(addr, params) {
  var url = util.parseUrl(addr, 'tcp+unix:')
  var l = params.unixProtocols[url.protocol]

  var connectProtocols = params.unixConnectProtocols

  if (!l) throw new Error('protocol ' + url.protocol + ' not found!')

  if (!params) params = {}

  params.protocol = url.protocol

  function create(url, params) {
    var s = l(defaults({ path: url.path, appKey: url.appKey, protocol: url.protocol, auth: url.auth }, params))
    var m = map({
      ready: function (e) {
        return {
          type: 'ready',
          address: addr
        }
      },
      connection: function (e) {
        return {
          type: 'connection',
          source: e.source,
          sink: e.sink,
          protocol: url.protocol
        }
      },
      message: function (e) {
        e.protocol = url.protocol
        return {
          type: 'message',
          data: e.data,
          protocol: e.protocol,
          remoteAddress: util.toRemoteAddress(e)
        }
      }
    })

    var n = _(s, m)
    n.protocol = s.protocol
    n.end = s.end
    n.push = s.push

    return n
  }

  if (util.isWindows()) return create(url, params)

  var notify = util.createNotify()

  var _ready = false
  var l2 = null
  var l1 = null

  _(l1 = create(url, params), on({
    ready: function (e) {
      _ready = true
      notify(e)
    },
    connection: notify,
    message: notify,

    end: function (err) {
      if (err != null && !_ready) {
        if (err.code === 'EADDRINUSE') {
          params.unixProtocols = connectProtocols
          connect(addr, params, function (_err, connection) {
            if (_err) {
              if (_err.code === 'ECONNREFUSED') {
                fs.unlink(url.path, function (err) {
                  _(l2 = create(url, params), _.drain(notify, notify.end))
                })
                return
              } else if (_err.code === 'ENOENT') return _(l2 = create(url, params), _.drain(notify, notify.end))

              throw _err
            }

            throw err
          })

          return
        }
      }

      notify.end(err)
    }
  }))

  var source = notify.listen()

  source.protocol = url.protocol || 'tcp+unix:'

  source.end = function () {
    if (l2) {
      l2.end()
      l2 = null
      l1 = null
      return
    }
    if (l1) {
      l1.end()
      l1 = null
    }
  }

  return source
}