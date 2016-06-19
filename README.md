# icebreaker-network
a network library for [pull-streams](https://github.com/dominictarr/pull-stream)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alligator-io.svg)](https://saucelabs.com/u/alligator-io)

[![Travis](https://img.shields.io/travis/alligator-io/icebreaker-network.svg)](https://travis-ci.org/alligator-io/icebreaker-network)
[![NPM](https://img.shields.io/npm/dm/icebreaker-network.svg)](https://www.npmjs.com/package/icebreaker-network)
[![AppVeyor](https://img.shields.io/appveyor/ci/alligator-io/icebreaker-network.svg)](https://ci.appveyor.com/project/alligator-io/icebreaker-network)

## Example
```javascript
  var _ = require('icebreaker');
  var network = require('icebreaker-network')
  var listen = network.listen('tcp://127.0.0.1:8090')

  _(listen, network.on({
    ready: function (e) {
      console.log('socket is ready on port: '+e.localPort)
      //connect to localhost for example
      network.connect(e.protocol + '//' + e.localAddress + ':' + e.localPort, function (connection) {
        // handle the client side pull-stream
        _('hello', connection, _.drain(function (d) {
          console.log(d.toString())
        }, function (err) {
          // close the socket for example
          listen.end()
        }))
      })
    },
    connection: function (s) {
      // handle the server side pull-stream
      _(s, _.map(function (d) {
        return d.toString() + ' world'
      }), s)
    },
    end: function () {
      console.log('socket closed');
    }
  }))
  ```
  
## License
MIT