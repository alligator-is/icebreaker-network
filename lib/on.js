var _ = require('icebreaker')
module.exports = function(events){
  function handle(e){
    if(events[e.type] !=null && typeof events[e.type] ==='function')events[e.type].call(this,e)
  }
  return typeof events['end']=== 'function'?_.drain(handle.bind(this||{}),events['end'].bind(this||{})):_.through(handle)
}
