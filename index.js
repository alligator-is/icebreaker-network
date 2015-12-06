var _ = require('icebreaker')
var PeerNet = require('icebreaker-peer-net');
var UDP = require('icebreaker-agent-udp')
var crypto = require('crypto');
var Network = require('./lib/network');
var SecretNetwork = require('./lib/secret');

var Discovery = require('./lib/discovery');

var network = new SecretNetwork({
  transports: [PeerNet(), UDP({
    loopback: true
  })]
});

new Discovery(network, {
  interval: 2000
});

network.start();

_(
  network.listen(),
  _.drain(function (t) {
  }, function () {
    console.log('end');

  }))


var network = new SecretNetwork({
    transports: [PeerNet({port:6554}), UDP({
    loopback: true
  })]
});

new Discovery(network, {
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
