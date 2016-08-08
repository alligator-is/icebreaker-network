var test = require('tape')
var _ = require('icebreaker')
var _ = require('icebreaker')
var listen = require('../../').listen
var on = require('../../').on

function check(params, params2, t) {

  var udp = listen(params,params2)

  _(udp,
    on({
      message: function (d) {
        t.equal(d.data.toString(), 'hello')
        udp.end()

      },
      end: t.notOk
    })

  )
  var udp2 = listen(params,params2)

  _(udp2,
    on({
      ready:function(){
        console.log('ready');
      },
      message: function (d) {
        t.equal(d.data.toString(), 'hello')
        udp2.end()
      },
      end: t.notOk
    }))

  udp.push('hello')

}

test('udp v4 multicast', function (t) {
  t.plan(4)
  check('udp://0.0.0.0:8801',{loopback:true,reuseAddr:true,multicast:'239.5.5.5'}, t)
})


test('udp v4 broadcast', function (t2) {
  t2.plan(4)
  check('udp://0.0.0.0:8802',{loopback:true,reuseAddr:true,broadcast:'255.255.255.255'}, t2)
})
