'use strict'
var Notify = require('pull-pushable')
var pick = require('lodash.pick')
var createServer = require('pull-ws/server')
var http = require('http')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'path', 'protocol')
  var notify = new Notify(function (err) { })

  var server = createServer({
    server: http.createServer(function (req, res) {
      res.end(params.port || '')
    })
  }, function (c) {
    c.type = 'connection'
    notify.push(c)
  }).listen(params, function () {
    notify.push({ type: 'ready' })
  })

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }

  source.protocol = params.protocol || 'ws:'

  source.end = function () {
    server.close(function () {
      notify.end(true)
    })
  }

  return source
}