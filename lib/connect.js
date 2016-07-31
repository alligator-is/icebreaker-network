var util = require('./util')
var defaults = require('lodash.defaults')

module.exports = function connect(s, params,cb) {
	if(util.isFunction(params) && !cb){
		cb=params
		params={}
	}
  var unixProtocols = params.unixProtocols||{}
  delete params.unixProtocols

  var protocols = params.protocols||{}


  function isUnixProtocol(url){
	 return unixProtocols[url.protocol] !=null
  }

	if(!util.isFunction(cb)) throw new Error('cb is required')

  var url = util.parseUrl(s)
  var c = protocols[url.protocol] || unixProtocols[url.protocol]
  if(!c && !isUnixProtocol(url))throw new Error('protocol '+ url.protocol +' not found!')
 	c(defaults(isUnixProtocol(url)?{path:url.path,protocol:url.protocol}:{
    port: url.port,
    host: url.hostname,
    protocol:url.protocol
  }, defaults(params,url.query)),cb)
}
