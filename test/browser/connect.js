var test = require('tape')
var goodbye = require('pull-goodbye')
var network = require('../../browser.js')
var _ = icebreaker

test('ws:connect',function(t){
t.plan(2)
$.get('/port',function(port){
  network.connect('ws://localhost:'+port,function(connection){
    console.log(connection)
    _(
      connection,
      goodbye({source:_('hello'),sink:_.drain(function(d){
        t.equals(d,'world')
      },function(err){
        t.notOk(err)
      })},'GoodBye'),
      connection
    )
    })
  })
})


