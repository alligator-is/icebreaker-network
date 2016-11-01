var test = require('tape')
var _ = require('icebreaker')
var listen = require('../../').listen
var connect = require('../../').connect
var on = require('../../').on
var map = require('../../').map
var os = require('os')

test('tcp v4', function (t) {
  t.plan(5)

  var l = listen('tcp://127.0.0.1:80')

  _(l, on({
    ready: function (e) {
      connect(e.address, function (err,connection) {
         t.notOk(err)
        _('hello', connection, _.drain(function (d) {
          t.equal(d.toString(), 'world')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {

       _(c,_.map(function(d){
        t.equal(d.toString(), 'hello')
        return 'world'
        }),c)
    },
    end: t.notOk
  }))
})

test('tcp ipv6', function (t) {
  t.plan(5)

  var l = listen('tcp://[::1]:8090')

  _(l, on({
    ready: function (e) {
      connect(e.address , function (err,connection) {
          t.notOk(err)
        _('hello', connection, _.drain(function (d) {
          t.equal(d.toString(), 'world')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {
      _(c,_.map(function(d){
        t.equal(d.toString(), 'hello')
        return 'world'
        }),c)  },
    end: t.notOk
  }))
})
var path = require('path')

test('tcp+unix', function (t) {
  t.plan(5)
  var l = listen('tcp+unix://'+os.tmpdir()+'/test3.socket')
  _(l, on({
    ready: function (e) {
      connect(e.address, function (err,connection) {
        t.notOk(err)
        _('hello', connection, _.drain(function (d) {
          t.equal(d.toString(), 'world')
        }, function (err) {
          t.notOk(err)
          l.end()
        }))
      })
    },
    connection: function (c) {
      _(c,_.map(function(d){
        t.equal(d.toString(), 'hello')
        return 'world'
        }),c)
    },
    end: function (err) {
      t.ok(err == null)
    }
  }))
})