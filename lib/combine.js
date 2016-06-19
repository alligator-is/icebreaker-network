var _ = require('icebreaker')
var Notify = require('pull-pushable')
var util = require('./util')
var on = require('./on')

function take(n, cb) {
  var c = 0
  return function (cb2) {
    if (c < n || n == c) {
      ++c
    }
    if (c < n) return
    if (n == c) return cb2()
    throw new Error('to many function calls!')
  }
}

function toLocalAddress(e) {
  var addr = e.protocol + '//' + e.localAddress
  if (e.localPort != null) addr += ':' + e.localPort
  return addr
}

function toRemoteAddress(e) {
  var addr = e.protocol + '//' + e.remoteAddress
  if (e.localPort != null) addr += ':' + e.remotePort
  return addr
}

module.exports = function combine() {
  var notify = Notify(function () {})
  var listeners = [].slice.call(arguments),
    ready = take(listeners.length),
    end = take(listeners.length)

  var _err = null, queue = [],  _ready = []

  listeners.forEach(function (l, i) {
    _(l, on({
      ready: function (e) {
        queue.push(e)
        ready(function () {
          notify.push({
            type: 'ready',
            localAddress: queue.reduce(function (a, b) {
              a.push(toLocalAddress(b))
              return a
            }, [])
          })
          queue = []
        })
        _ready.push(i)
      },
      connection: function (e) {
        notify.push({
          type: 'connection',
          localAddress: toLocalAddress(e),
          remoteAddress: toRemoteAddress(e),
          source: e.source,
          sink: e.sink
        })
      },
      message: function (e) {
        notify.push({
          type: 'message',
          data: e.data,
          localAddress: toLocalAddress(e),
          remoteAddress: toRemoteAddress(e)
        })
      },
      end: function (err) {
        if (err) _err = err
        listeners.forEach(function (l2, i2) {
          if (i2 !== i) {
            l2.end(err)
          }
        })
        end(function () {
          notify.end(_err)
          _err = null
          queue = null
        })
      }
    }))
  })

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }

  source.push = function () {
    var args = arguments
    listeners.forEach(function (l) {
      if (l.type === 'pushable') l.push.apply(null, [].slice.call(args))
    })
  }

  source.end = function () {
    if (ready.length > 0)
      return listeners[_ready.shift()].end()
    notify.end(true)
  }

  return source
}
