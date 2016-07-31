var _ = require('icebreaker')
var util = require('./util')
var defaults = require('lodash.defaults')
var on = require('./on')
var connect = require('./connect')
var fs = require('fs')

var Notify = require('pull-pushable')

module.exports = function unixListen(s, params) {
  var url = util.parseUrl(s, 'tcp+unix:')
  var l = params.unixProtocols[url.protocol]
  delete params.unixProtocols
  var connectProtocols = params.unixConnectProtocols
  delete params.unixConnectProtocols
  if (!l) throw new Error('protocol ' + url.protocol + ' not found!')

  if (!params) params = {}
  params.protocol = url.protocol

  function create(url, params) {
    return l(defaults({
      path: url.path,
    }, defaults(params, url.query)))
  }

  if (util.isWindows()) return create(url, params)

  var notify = Notify(function () {
  })
  var _ready = false
  var l2 = null
  var l1 = null

  _(l1 = create(url, params), on({

    ready: function (e) {
      _ready = true
      notify.push(e)
    },
    connection: notify.push,
    message: notify.push,
    end: function (err) {
        if (err != null && !_ready) {
        if (err.code === 'EADDRINUSE') {
          params.unixProtocols = connectProtocols
          connect(s, params, function (connection) {
            _([], connection, _.onEnd(function (err) {
              if (err.code === 'ECONNREFUSED') {
                fs.unlink(url.path, function (err) {
                  _(l2 = create(url, params), _.drain(notify.push, notify.end))
                })
              } else if (err.code === 'ENOENT')
                _(l2 = create(url, params), _.drain(notify.push, notify.end))
            }))
          })
            return
        }
      }
      notify.end(err)
    }
  }))

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }

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
