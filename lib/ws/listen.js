'use strict'
var pick = require('lodash.pick')
var createServer = require('pull-ws/server')
var http = require('http')
var util = require('../util')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port', 'path', 'protocol')
  var notify = util.createNotify()
  var _server=http.createServer(function (req, res) {
      res.end(params.port || '')
    })
  var server = createServer({
    server:_server
  }, function (c) {
    c.type = 'connection'
    notify(c)
  })
  .listen(params, function () { 
    notify({ type: 'ready' ,address: _server.address().address,port:_server.address().port}) 
  })

  var source = notify.listen()

  source.protocol = params.protocol || 'ws:'

  source.end = function (err) {
    server.close(function () {
      notify.end(err)
    })
  }

  return source
}