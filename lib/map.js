'use strict'
var _ = require('icebreaker')

module.exports = function (events) {
  return _.map(function (e) {
    if (events[e.type] != null && _.isFunction(events[e.type])) return events[e.type].call(this, e) || e
    return e
  })
}