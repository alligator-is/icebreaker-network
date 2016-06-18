var _
var ws ;
try{
  _=window.icebreaker;
  ws = function(a){
    var s = new WebSocket(a)
    s.binaryType = 'blob';
    return s;
  }
}catch(e){
  _=require('icebreaker')
  ws=require('ws').connect
}

var Net = require('net')
var pick = require('lodash.pick')
var defaults = require('lodash.defaults')

var pws = require('pull-ws')
var url = require('url')
var dns = require('dns')
var util = require('../util')

module.exports = function (params, cb) {
  params = pick(params, 'host', 'port', 'path','protocol')
  var address = {
    protocol: params.protocol,
    hostname:params.host,
    port:params.port,
    pathname :params.path,
    slashes: true,
  }
  if (params.path == null) {
    address.hostname = params.host;
    address.port = params.port;
  } else address.pathname = params.path

  function connect() {

    var c = pws(ws(url.format(address)))
    c.remoteAddress = params.host;
    c.remotePort = params.port;

    c = defaults(c, pick(c, ['remoteAddress', 'localAddress', 'remoteFamily', 'localPort', 'remotePort']))
    c = defaults({
      protocol: params.protocol || 'ws:',
      type: 'connection'
    }, c)
    if (!c.remoteAddress && !c.localAddress) c.localAddress = c.remoteAddress = params.path;
    if (cb) {
      cb(c)
      cb = null
    }
  }


  if (params.host != null &&Net!=null&& util.isFunction(Net.isIP) &&!Net.isIP(params.host)) {
    dns.lookup(params.host, function (err, ip) {
      address.hostname = params.host = err ? params.host : ip
      connect()
    })
    return
  }

  connect();
}
