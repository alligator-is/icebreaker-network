'use strict'
var _ = require('icebreaker')

module.exports = function(events){
  return _.asyncMap( function handle(e,cb){
    if(events[e.type] !=null && typeof events[e.type] ==='function')return events[e.type].call(this,e,function(d){
      cb(null,d)
    })
    cb(null,e)
  })
}