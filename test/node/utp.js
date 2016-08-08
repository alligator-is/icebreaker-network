var test = require('tape')
var _ = require('icebreaker')
var listen = require('../../').listen
var connect = require('../../').connect
var map = require('../../').map
var on = require('../../').on
var os = require('os')
var serializer = require('pull-serializer')
var goodbye = require('pull-goodbye')
try {
  require('utp-native')
}
catch (err) {
  return
}

function onConnection(l, t) {
  return function (c) {
    return _(c, serializer(goodbye({
      source: _('world'),
      sink: _.drain(function (d) {
        t.equal(d.toString(), 'hello', 'equal')
      }, l.end)
    }, 'GoodBye')), c)
 
  }
}

function onConnect(l, t) {
  return function (err,connection) {
    t.notOk(err)
    
    _(
      connection,
      serializer(goodbye({
        source: _('hello'),
        sink: _.drain(function (d) {
          t.equal(d.toString(), 'world', 'equals')
        }, l.end)
      }, 'GoodBye')),
      connection
    )
    return connection
  }
}

test('utp', function (t) {
  t.plan(15)

  var ziggy = listen('udp://127.0.0.1:8091',{loopback:false})
  var lastInfo
  var c = 0

  var ce = 0
  _(ziggy, on({
    ready: function (e) {
      var handle = {
        end: function (err) {
          t.notOk(err)
          ++c
          if (c === 4) {
            alice.end()
            bob.end()
          }
        }
      }

      var handle2 = {
        end: function (err) {
          t.notOk(err)
          ++ce
          if (ce === 2) ziggy.end()
        }
      }

      function createClient(port, e, t) {
        var l = listen('utp://127.0.0.1:' + port)
        
        var s = _(l, map({
          ready: function (e2) {
            l.push(Buffer('ping'),e.address)
            t.equal(e2.address.indexOf(port)!==-1,true )
            return e2
          },
          message: function (msg) {
            var d = msg.data
            connect(d.toString(), onConnect(handle, t))
            return msg
          },
          connection: onConnection(handle, t)
        }))

        s.end = l.end
        return s
      }

      var alice = createClient(8092, e, t)
      _(alice, on(handle2))

      var bob = createClient(8093, e, t)
      _(bob, on(handle2))

    },
    message: function (msg) {
      if (lastInfo) {
        ziggy.push(lastInfo,msg.remoteAddress.replace('udp','utp'))
        ziggy.push(msg.remoteAddress.replace('udp','utp'), lastInfo)
      }
      lastInfo = msg.remoteAddress.replace('udp','utp')
    },
    end: t.notOk
  }))
  var send =false;
})