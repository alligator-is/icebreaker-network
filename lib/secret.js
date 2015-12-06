var Network = require('./network');
var keys=require('ssb-keys');
var crypto = require('crypto');
var _ = require('icebreaker');

function SecretNetwork(params){
  params = params || {};
  params.workgroup = params.workgroup||'nhQJmn42jm2x/RLKhEkImnLTASqHppSIYq5UGQ300Ck=';
  this.keys= params.keys || keys.generate();
  this.id=this.keys.id;
  Network.call(this,params);
}

var proto = SecretNetwork.prototype = Object.create(Network.prototype);

proto.listen = function(){
  return _(Object.getPrototypeOf(proto).listen.apply(this,arguments),_.asyncMap(function(e,cb){
    if(e.event==='connection'){
      console.log(e.args);
    }
    cb(null,e);
  }));
}

proto.connect = function (params) {
  if(!params.key)throw new Error('Network::connect: key is required')
  return Object.getPrototypeOf(proto).connect.call(this,params);
}

module.exports = SecretNetwork;
