  var _ = require('icebreaker')
  var network = require('../')
  var listen = network.listen('tcp://127.0.0.1:8090')

  _(listen, network.on({
    ready: function (e) {
      console.log('socket is ready on port: '+e.address)
      //connect to localhost for example
      network.connect(e.address, function (err,connection) {
        // handle the client side pull-stream
        if(err)  throw err
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
      console.log('socket closed')
    }
  }))
  