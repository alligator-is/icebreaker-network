var Notify = require('pull-pushable'),
  pick = require('lodash.pick'),
  to = require('stream-to-pull-stream'),
  defaults = require('lodash.defaults'),
  pws = require('pull-ws')
var http = require('http');
var ws = require('ws');

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port','path','protocol')
  var notify = new Notify(function (err) {
	})

  var server = http.createServer(function(req,res){
    res.end(params.port||'')
  })

  var wsServer = null

  function close(cb){
    if(wsServer){
      wsServer.close()
      wsServer=null;
    }
    if(server){
      server.close(cb);
      server=null;
    }
  }

  server.once('error', function (err) {
    err.type = "error"
		close(function(){
			notify.end(err)
		})
  })

  var source = function () {
  	return notify.apply(null, [].slice.call(arguments))
  }

  source.protocol = params.protocol || 'ws:'

  source.end = function () {
	  close(function () {
      notify.end(true)
    })
	}

  server.listen(params,function(){
    wsServer = ws.createServer({server:server});

    wsServer.on('connection',function(o){
      var c = defaults(pws(o), pick(o.upgradeReq.socket, ['remoteAddress', 'localAddress', 'localPort', 'remotePort']))
      if(!c.remoteAddress && !c.localAddress)c.localAddress=c.remoteAddress=params.path;
      notify.push(defaults({ type: 'connection',protocol:source.protocol}, c))
    })

    notify.push({type:'ready',protocol:source.protocol,localAddress:server.address().address||server.address(),localPort:server.address().port})
  })

  return source
}
