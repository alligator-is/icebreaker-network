var test = require('tape')
var _ = require('icebreaker')
var listen = require('../../').listen
var connect = require('../../').connect
var on = require('../../').on

var delay = function () {
  return function (read) {
    return function (err, cb) {
      setTimeout(function () {
        read(null, cb)
      }, 10)
    }
  }
}

test('tcp v4', function (t) {
  t.plan(5)

  var l = listen('ws://127.0.0.1:8090')

  _(l, on({
    ready: function (e) {
      t.equal(e.localPort, 8090)
      connect(e.protocol + '//' + e.localAddress + ':' + e.localPort, function (connection) {
        _('hello', delay(), connection, _.drain(function (d) {
          t.equal(d.toString(), 'world', 'equals')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {
      _(c, _.map(function (d) {
        t.equal(d.toString(), 'hello', 'equal')
        return 'world'
      }), c);
    },
    end: t.notOk
  }))
})


test('ws ipv6', function (t) {
  t.plan(5)

  var l = listen('ws://[::1]:8090')

  _(l, on({
    ready: function (e) {
      t.equal(e.localPort, 8090)
      connect(e.protocol + '//[' + e.localAddress + ']:' + e.localPort, function (connection) {
        _('hello', delay(), connection, _.drain(function (d) {
          t.equal(d.toString(), 'world')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {
      _(c, _.map(function (d) {
        t.equal(d.toString(), 'hello')
        return 'world'
      }), c)
    },
    end: t.notOk
  }))
})

test('ws+unix', function (t) {
  t.plan(4)

  var l = listen('ws+unix://./test.socket')

  _(l, on({
    ready: function (e) {
      connect(e.protocol + '//' + e.localAddress, function (connection) {
        _('hello', delay(), connection, _.drain(function (d) {
          t.equal(d.toString(), 'world')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {
      _(c, _.map(function (d) {
        t.equal(d.toString(), 'hello')
        return 'world'
      }), c)
    },
    end: function (err) {
      t.ok(err == null);
    }
  }))
})
