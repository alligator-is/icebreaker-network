var test = require('tape')
var _ = require('icebreaker')
var network  = require('../../')
var combine = network.combine
var listen = network.listen
var connect = network.connect
var on = network.on
var os = require('os')
var n = combine(listen('tcp://localhost:8084'),listen('udp://0.0.0.0:8089?reuseAddr=true&loopback=true&multicast=239.5.5.5'),listen('tcp+unix://'+os.tmpdir()+'/test4.socket'))

test('combine',function(t){
  t.plan(9)
  _(n, on({
    ready: function (e) {
      var index=e.localAddress.indexOf('tcp://127.0.0.1:8084');
      t.ok(e.localAddress.indexOf('udp://0.0.0.0:8089')!==-1)
      t.ok(index!==-1)

      t.equals(e.localAddress.length,3)
			connect(e.localAddress[index],function(connection){
		  _('hello',connection,_.drain(function(d){
        t.equals(d.toString(),'world2');
      },function(){
        console.log('end')
      }))
			})
    },
    message: function (e) {
      t.equals(e.data.toString(),'world')
      t.equals(e.localAddress,'udp://0.0.0.0:8089')
      n.end()
    },
    connection: function (e) {
      t.equals(e.localAddress,'tcp://127.0.0.1:8084')
      _(['world2'],e,_.drain(function(d){
        n.push('world')
        t.equals(d.toString(),'hello')
      }))
    },
    end: function (err) {
      t.notOk(err)
      
      t.end()
    }
  }))
})
