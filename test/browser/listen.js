var _ = require('icebreaker');
var network = require('../../');
var l = null;
console.log('listen on '+process.env.ZUUL_PORT)
var goodbye = require('pull-goodbye')
_(l=network.listen('ws://localhost:'+process.env.ZUUL_PORT),network.on({
  ready:function(e){
    console.log('ready',e);
  },
  connection:function(c){
    console.log('connection')
  _(c,goodbye({ source:_('world'),sink:_.onEnd(l.end)},'GoodBye'),c)
},
end:function(err){
  process.exit();
}}))
