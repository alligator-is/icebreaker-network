var Notify = require('pull-pushable'),
  Net = require('net'),
  pick = require('lodash.pick'),
  to = require('stream-to-pull-stream'),
  defaults = require('lodash.defaults'),
  createSocket = require('datagram-stream')

var listen = module.exports = function (params) {
  var o = createSocket({address:params.host||params.localAddress,port:params.port,loopback:params.loopback,reuseAddr:params.reuseAddr,multicast:params.multicast,unicast:params.unicast,broadcast:params.broadcast,multicastTTL:params.multicastTTL,bindingPort:params.localPort})

  var notify = new Notify(function (err) {})

  o.on('data',function(msg){
    var rinfo = msg.rinfo
    delete msg.rinfo
    var addr = o.address()
    notify.push({
     type:'message',
     data:msg,
     protocol:source.protocol,
     localAddress:addr.address,
     localPort:addr.port,
     remoteAddress:rinfo.address,
     remotePort:rinfo.port,
    })
  })

  o.once('close',function(){
    notify.end(true)
  })

  o.once('error', function(err){
    err.type = "error"
    notify.end(err)
    try{
      o.close()
    }
    catch(e){}
  })

  var source = function () {
    return notify.apply(null, [].slice.call(arguments))
  }

  source.protocol = params.protocol||'udp:'
  source.end = function () {
		try{
	    o.close()
    }
    catch(e){
      notify.end(e)
    }
  }

  source.push = function(msg){
    o.write(msg)
  }

  source.type = 'pushable'
  notify.push({type:'ready',protocol:source.protocol,localAddress:params.host,localPort:params.port})
  return source
}
