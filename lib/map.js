'use strict'
var _ = require('icebreaker')

module.exports = function (events) {
  return _.map(function (e) {
    if (events[e.type] != null && typeof events[e.type] === 'function') return events[e.type].call(this, e) || e
    return e
  })
}