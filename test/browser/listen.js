var _ = require('icebreaker');
var network = require('../../');
var l = null;
var goodbye = require('pull-goodbye')
_(l=network.listen('ws://localhost:'+process.env.ZUUL_PORT),network.on({connection:function(c){
  _(c,goodbye({ source:_('world'),sink:_.onEnd(l.end)},'GoodBye'),c)
},
end:function(err){
  process.exit();
}}))
