var test = require('tape')
var _ = require('icebreaker')
var network  = require('../../')
var combine = network.combine
var listen = network.listen
var connect = network.connect
var on = network.on
var os = require('os')
var goodbye = require('pull-goodbye')

var n = combine(listen('tcp://localhost:8089'),listen('udp://0.0.0.0:8089',{reuseAddr:true,loopback:true,multicast:'239.5.5.5'}),listen('tcp+unix://'+os.tmpdir()+'/test4.socket'))

test('combine',function(t){
  t.plan(10)
  _(n, on({
    ready: function (e) {
      var index=e.address.indexOf('tcp://localhost:8089')
      t.ok(e.address.indexOf('udp://0.0.0.0:8089')!==-1)
      t.ok(index!==-1)
 
      t.equals(e.address.length,3)
			connect(e.address[index],function(err,connection){
        t.notOk(err)
		  _('hello',connection,_.drain(function(d){
        t.equals(d.toString(),'world2')
      },t.notOk))
			})
    },
    message: function (e) {
      t.equals(e.data.toString(),'world')
      n.end()
    },
    connection: function (e) {
      _(['world2'],e,_.drain(function(d){
        n.push('world')

        t.equals(d.toString(),'hello')
      },t.notOk))
    },
    end: function (err) {
      t.notOk(err) 
      t.end()
    }
  }))
})
