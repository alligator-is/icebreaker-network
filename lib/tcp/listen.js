var Notify = require('pull-pushable'),
  Net = require('net'),
  pick = require('lodash.pick'),
  to = require('stream-to-pull-stream'),
  defaults = require('lodash.defaults')

module.exports = function listen(params) {
  if (params) params = pick(params, 'host', 'port','path','protocol')

  var notify = new Notify(function (err) {
	})

  var server = Net.createServer(function (o) {
    o.setKeepAlive(params.keepAlive || false)
    o.setNoDelay(params.noDelay || true)

    var c = defaults(to.duplex(o), pick(o, ['remoteAddress', 'localAddress', 'localPort', 'remotePort']))
    if(!c.remoteAddress && !c.localAddress)c.localAddress=c.remoteAddress=params.path;
    notify.push(defaults({ type: 'connection',protocol:source.protocol}, c))
  })

  server.once('error', function (err) {
    err.type = "error"
		try{
		server.close(function(){
			notify.end(err)
		})
		}catch(e){

			notify.end(err)
		}
  })

  var source = function () {
  	return notify.apply(null, [].slice.call(arguments))
  }

  source.protocol = params.protocol || 'tcp:'

  source.end = function () {
		try{
    server.close(function () {
      notify.end(true)
    })
    }
    catch(e){
      notify.end(e)
		}
	}

  server.listen(params,function(){
    notify.push({type:'ready',protocol:source.protocol,localAddress:server.address().address||server.address(),localPort:server.address().port})
  })

  return source
}
