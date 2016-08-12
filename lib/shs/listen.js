var asyncMap = require('../asyncMap')
var _ = require('icebreaker')
var util = require('../util')
var cl = require('chloride')
var SHS = require('secret-handshake')

module.exports = function listen(params) {

    params.protocol = params.protocol || 'shs+tcp:'
    var protocol = params.protocol.substring(params.protocol.indexOf('+')+1)

    protocol = params.protocols[protocol] || params.unixProtocols[protocol]
    if(!util.isFunction(params.authenticate)) throw new Error('authenticate function required')
    if(!util.isPlainObject(params.keys) && !util.isString(params.keys.private) && !util.isString(params.keys.public))throw new Error('private and public keys required')

    var create = SHS.createServer(params.keys,params.authenticate,new Buffer(cl.crypto_hash_sha256(new Buffer(params.appKey)),'base64'),params.timeout)
    var listen= _(protocol=protocol(params),asyncMap({
        ready:function(e,cb){
            e.appKey = params.appKey;
            cb(e);
        },
        connection:function(c,cb){
            _(c,create(function(err,s){
                if(err){
                    c.source=_.error(err);
                    c.sink = function (read) { read(err, function () {}) }
                    cb(c);
                    return
                }
                cb(util.defaults({appKey:params.appKey},util.defaults(s,c)))
            }),c)
    }}))

    function source(){
        listen.apply(null, [].slice.call(arguments))
    }

    source.protocol = params.protocol
    source.end =protocol.end 
    return source  
}