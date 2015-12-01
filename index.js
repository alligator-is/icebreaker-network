var _ = require('icebreaker')
var PeerNet = require('icebreaker-peer-net');
var UDP = require('icebreaker-agent-udp')
var Notify = require('pull-notify')
var crypto = require('crypto');

function Network(params) {
  var self = this;
  //crypto.createHash('sha256').update('icebreaker').digest().toString('base64'));
  this.workgroup = params.workgroup || 'RtyDZFaIdQvwVAaTCc4N58We80lrxiTHBAPta/xT2U4=';
  this._notify = Notify()
  this.transports = {};
  this.transports = params.transports;
  this.transports.forEach(function (t) {
    t.on('started', function () {
      self._notify({
        event: 'started',
        args: t
      });
    });
    t.on('stopped', function () {
      self._notify({
        event: 'stopped',
        args: t
      });
    });
    t.on('response', function (msg) {
      self._notify({
        event: 'response',
        args: msg
      });
    });
    t.on('connection', function (connection) {
      self._notify({
        event: 'connection',
        args: connection
      });
    });

    _(self._notify.listen(), _.drain(function (e) {
      if (e.event === 'started') {
        console.log(e.args);
      }
      if (e.event === 'request') {
        t.emit(e.event, e.args);
      }
    }));
  })
}

var proto = Network.prototype = {}

proto.start = function () {
  var self = this;
  this.transports.forEach(function (t) {
    self._notify({
      event: 'start',
      args: t
    })
    if (t.start) t.start();
  });
}

proto.stop = function () {
  var self = this;
  this.transports.forEach(function (t) {
    self._notify({
      event: 'stop',
      args: t
    })
    if (t.stop) t.stop();
  });
}

proto.listen = function (event) {
  var listen = _.chain().add(this._notify.listen())
  if (event) listen.filterNot(function (e) {
    return event === e
  })
  return listen
}

proto.connect = function (peerInfo) {

}

var network = new Network({
  transports: [PeerNet(), UDP({
    loopback: true
  })]
});
require('./lib/discovery')(network, {
  interval: 2000
});
network.start();

_(
  network.listen(),
  _.drain(function (t) {
    console.log(arguments);
  }, function () {
    console.log('end');

  }))

module.exports = Network
