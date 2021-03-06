'use strict'
var pick = require('lodash.pick')
var createServer = require('pull-ws/server')
var http = require('http')
var _ = require('icebreaker')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port','server', 'path', 'protocol')
  
  var notify = _.notify()
  
  var _server=params.server || http.createServer(function (req, res) {
    res.end('')
  })

  var server = createServer({
    server:_server
  },
  function (c) {
    c.type = 'connection'
    delete c.url
    notify(c)
  })
  .listen({port:params}, function () {
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