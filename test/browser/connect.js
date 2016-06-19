var test = require('tape')
var goodbye = require('pull-goodbye')
var network = require('../../browser.js')
var _ = icebreaker

test('ws:connect', function (t) {
  t.plan(2)
  network.connect('wss://echo.websocket.org', function (connection) {
    _(
      connection,
      goodbye({
        source: _('hello'),
        sink: _.drain(function (d) {
          t.equals(d, 'hello')
        }, function (err) {
          console.log(err);
          t.notOk(err)
        })
      }, 'GoodBye'),
      connection
    )
  })
})
