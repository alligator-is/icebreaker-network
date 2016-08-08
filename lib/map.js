'use strict'
var _ = require('icebreaker')
module.exports = function(events){
  function handle(e){
    if(events[e.type] !=null && typeof events[e.type] ==='function')return events[e.type].call(this,e)||e
    return e
  }
  return _.map(handle)
}