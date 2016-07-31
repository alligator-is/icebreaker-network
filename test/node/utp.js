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
    _(c, serializer(goodbye({
      source: _('world'),
      sink: _.drain(function (d) {
        t.equal(d.toString(), 'hello', 'equal')
      }, l.end)
    }, 'GoodBye')), c)
    return c
  }
}

function onConnect(l, t) {
  return function (connection) {
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
  t.plan(16)

  var ziggy = listen('udp://127.0.0.1:8091')
  var lastInfo
  var c = 0

  var ce = 0
  _(ziggy, on({
    ready: function (e) {
      t.equal(e.localPort, 8091)
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
            l.push(Buffer('ping'), e.localPort, e.localAddress)
            t.equal(e2.localPort, port)
            return e2
          },
          message: function (msg) {
            var d = JSON.parse(msg.data)
            connect('utp://' + d.host + ':' + d.port, onConnect(handle, t))
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
      t.equal(msg.data.toString(), 'ping')
      if (lastInfo) {
        ziggy.push(JSON.stringify(lastInfo), msg.remotePort, msg.remoteAddress)
        ziggy.push(JSON.stringify({ port: msg.remotePort, host: msg.remoteAddress }), lastInfo.port, lastInfo.host)
      }
      lastInfo = { port: msg.remotePort, host: msg.remoteAddress }
    },
    end: t.notOk
  }))
})