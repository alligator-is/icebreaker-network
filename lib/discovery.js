var _ = require('icebreaker');
var net = require('net')
var isPlainObject = require('is-plain-object');
var isString = require('is-string');
var addr = require('ssb-address');

module.exports = function (network, params) {
  params = params || {};
  var timer = null;
  var cleanup = null;
  var table = {};
  var addrs={};
  function toAddress(c){
   return addr({port:c.port,host:c.address,protocol:c.transport})
  }
  params.cleanup = params.cleanup|| 9000
  var listen = network.listen();
  _(listen, _.drain(function (e) {
    if(e.event === "connect"){
      var a = toAddress(e.args);
      addrs[a.domain] = a
    }
    else if (e.event === "disconnected"){
      var a = toAddress(e.args)
      if(addrs[a.domain])delete addrs[a.domain];
      console.log('disconnected',a.domain);
    }
    if (e.event == 'start') {
      if (timer == null) {
        timer = setInterval(function () {
          network._emit('request',network.id);
        }, params.interval || 7000);

        cleanup = setInterval(function () {
         var now = new Date().getTime();
          for(var i in table){
           var d = table[i];
            if(d<now){
              delete table[i];
            }
         }
         }, params.cleanup/3);
      }
    }
    else if (e.event === 'response') {
      if (isString(e.args)) {
          var id = e.args;
          if(id !== network.id){
            if(table[id]!=null)return;
              var domains = network.transports.filter(function(t){
              return typeof t.connect === 'function'
            })
            .forEach(function(t){
              network._emit('request',{'type':'whois',to:id,from:network.id,transport:t.name,workgroup:network.workgroup});
            })
          }
      }
      else if(isPlainObject(e.args) && e.args.type==="whois"){
        var info = e.args;
          if(info.to === network.id && info.from !== network.id){
          if(info.workgroup!== network.workgroup)return;
          if(isString(info.transport)){
            network.transports.forEach(function(item){
              if(info.transport===item.name){
                var msg = {
                  type:'info',
                  from:info.to,
                  to:info.from,
                  workgroup:network.workgroup,
                  transport:item.name,
                  port:item.port,
                  address:item.address
                }
                if( isPlainObject(network.keys) && network.keys.public!=null) msg.key=network.keys.public
                network._emit('request',msg);
               }
            });
          }
        }
     }
     else if(isPlainObject(e.args) && e.args.type==="info"){
        var info = e.args;
        if(info.to === network.id && info.from !== network.id){
          if(info.workgroup !== network.workgroup)return;
          try{
            if(isString(info.from) && info.from.length>0 && !table[info.from]){
              if(!table[info.from]){
                table[info.from]= new Date().getTime()+params.cleanup
                info.id = info.from;
                if(!addrs[addr({host:info.address,protocol:info.transport,port:info.port}).domain]){
                  network.connect(info);
                }
              }
            }
          }catch(e){
            network._emit('error',e);
          }
        }
     }
    }
    else if (e.event === 'stop') {
      if (timer) {
        clearInterval(timer)
        timer = null;
      }
      if (cleanup) {
        clearInterval(cleanup)
        cleanup = null;
        table = null;
      }
  }}));
}
