'use strict'
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


module.exports = function combine() {
  var notify = Notify(function () { })
  var listeners = [].slice.call(arguments),
    ready = take(listeners.length),
    end = take(listeners.length)

  var _err = null, queue = [], _ready = []

  listeners.forEach(function (l, i) {
    _(l, on({
      ready: function (e) {
        queue.push(e)
        ready(function () {
          notify.push({
            type: 'ready',
            address: queue.reduce(function (a, b) {
              a.push(b.address)
              return a
            }, [])
          })
          queue = []
        })
        _ready.push(i)
      },
      connection: notify.push,
      message: notify.push,
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
      if (util.isFunction(l.push)) l.push.apply(null, [].slice.call(args))
    })
  }

  source.end = function () {
    if (_ready.length > 0)
      return listeners[_ready.shift()].end()
    notify.end(true)
  }

  return source
}