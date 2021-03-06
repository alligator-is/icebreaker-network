var test = require('tape')
var _ = require('icebreaker')
var listen = require('../../').listen
var connect = require('../../').connect
var on = require('../../').on
var os = require('os')
var goodbye = require('pull-goodbye')


function onConnection(l, t) {
  return function (c) {
    _(c, goodbye({
      source: _('world'),
      sink: _.drain(function (d) {
        t.equal(d.toString(), 'hello', 'equal')
      }, l.end)
    }, 'GoodBye'), c)
    
  }
}

function onConnect(l, t) {
  return function (err,connection) {
    t.notOk(err)
    if(err)return
    _(
      connection,
      goodbye({
        source: _('hello'),
        sink: _.drain(function (d) {
          t.equal(d.toString(), 'world', 'equals')
        }, function (err) {
          t.notOk(err)
          l.end()

        })
      }, 'GoodBye'),
      connection
    )
  }
}

test('ws v4', function (t) {
  t.plan(5)

  var l = listen('ws://127.0.0.1:8090')

  _(l, on({
    ready: function (e) {
      connect(e.address, onConnect(l, t))
    },
    connection: onConnection(l, t),
    end: t.notOk
  }))
})


test('ws ipv6', function (t) {
  t.plan(5)

  var l = listen('ws://[::1]:8091')

  _(l, on({
    ready: function (e) {
      connect(e.address , onConnect(l, t))
    },
    connection: onConnection(l, t),
    end: t.notOk
    
  }))
})
var path = require('path')

test('ws+unix', function (t) {
  t.plan(5)
  var l = listen('ws+unix://' + path.join("/",os.tmpdir(),'/test4.socket'))
  _(l, on({
    ready: function (e) {
        connect(e.address, onConnect(l, t)) 
    },
    connection: onConnection(l, t),
    end: function (err) {
      t.ok(err == null)
    }
  }))
})
