var util = require('./util')
var defaults = require('lodash.defaults')

module.exports = function listen(s, params) {
  var url = util.parseUrl(s)

  var l =params.protocols[url.protocol]
  delete params.protocols
  if (!l) throw new Error('protocol ' + url.protocol + ' not found!')

  return l(defaults({
    port: url.port,
    host: url.hostname
  }, defaults(params, url.query)))
}
