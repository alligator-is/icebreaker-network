'use strict'
var _ = require('./icebreaker')
var paramap = require('pull-paramap')

module.exports = function(events) {
  return paramap(function handle(e, cb) {
    if (events[e.type] != null && typeof events[e.type] === 'function')
      return events[e.type].call(this, e, function (d) {
        cb(null, d)
      })
    cb(null, e)
  })
}
