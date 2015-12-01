var _ = require('icebreaker');
var net = require('net')
var addr = require('ssb-address');
module.exports=function(network,params){
	params=params||{};
	var timer=null;
	var listen =network.listen();
	_(listen,_.drain(function(e){
		if(e.event=='start'){
			if(timer==null){
			timer = setInterval(function () {
				var addrs = [];
				_(network.transports,_.find(function(){
					
				},function(){}))
				network.transports.some(function(t){
					if(typeof t.connect !== 'function')return false;
			
					var o={protocol:t.name+':',port:t.port,host:t.address,workgroup:network.workgroup}
						
					addrs.push(	addr(o))
					return false;
			})
				
					network._notify({event:'request',args:{workgroup:network.workgroup,domain:addrs.shift().domain}});
			},params.interval||4000);	
		}
		}
		if(e.event==='response')
		{
			if(e.args.workgroup===network.workgroup){	
			}
		}
		if(e.event==='stop'){
			if(timer){
				clearInterval(timer)
				timer=null;
			}
		}
	}));
}