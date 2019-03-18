# icebreaker-network
A network library for [pull-streams](https://github.com/dominictarr/pull-stream) to handle multiple protocols with the same interface.

[![Travis](https://img.shields.io/travis/alligator-io/icebreaker-network.svg)](https://travis-ci.org/alligator-io/icebreaker-network)
[![NPM](https://img.shields.io/npm/dm/icebreaker-network.svg)](https://www.npmjs.com/package/icebreaker-network)

## Usage
```javascript
  var _ = require('icebreaker')
  var network = require('icebreaker-network')
 
  var listen = network.listen('tcp://127.0.0.1:8090')

  _(listen, network.on({
    ready: function (e) {
      console.log('socket is ready on port: '+e.address)
      //connect to localhost
      network.connect(e.address, function (err,connection) {
        // handle the client side pull-stream
        if(err)  throw err
        _('hello', connection, _.drain(function (d) {
          console.log(d.toString())
        }, function (err) {
          // close the socket
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
  ```
## API

### URL format for TCP, WS, UTP
``` {protocol}://{ip}:{port}/ ```

### URL format for TCP, WS unix sockets.
``` {protocol+unix}://{path}```

### URL format for protocols with secret-handshake 
``` shs+{protocol}://{Base64 and URL encoded public key}@{ip}:{port}/{app_key} ```

### URL format for TCP,WS unix sockets with secret-handshake 
``` shs+{protocol}+unix://{Base64 and URL encoded public key}@{path}/{app_key} ```

### Events
* ready 
* message
* connection
* end
```javascript
   _(
     network.listen('tcp://127.0.0.1:8090'),
     network.on({
      ready:function(e){
        console.log('tcp socket is ready on address: '+e.address)  
      },
      end:function(){

      }
    })
  )
```

### network.on(events)
Helper to handle events on a listener.
* Returns a sink if the end event is set, otherwise a through.

```javascript
_(
  listener,
  network.on({
  ready:function(e){
    console.log(e.address)
  },
  connection:function(e){
    // handle the connection
  }
  end:function(err){ 
    if(err) console.log(err)
  }
}))
```
### network.map(events)
Helper to map events on a listener.
* Returns a through.

```javascript
_(
  network.listen('tcp://127.0.0.1:8090'),
  network.map({
    connection:function(e){
      e.isSuper = true
      return e
    }
  }),
  network.on({
    connection:function(e){
      console.log(e)
    },
    end:function(err){
      console.log(err)
    }
  })
)
```

## network.asyncMap(events)
The async version of map.
* Returns a through.

```javascript
_(
  network.listen('tcp://127.0.0.1:8090'),
  network.asyncMap({
    connection:function(e,done){
      e.isSuper = true
      done(e)
    }
  }),
  network.on({
    connection:function(e){
      console.log(e)
    },
    end:function(err){
      console.log(err)
    }
  })
)
```
## network.connect(url,[params],callback)
This connects to a specified url address.
* Url to connect.
* Parameters for the selected protocol is optional, when the selected protocols is not a shs protocol.
* callback(error,connection) returns error or a connection duplex stream.
* For shs protocols is params.keys.publicKey and  params.keys.secretKey required.
```javascript
  var cl = require('chloride')
  var keys = cl.crypto_sign_keypair()
```
## network.listen(url,params)
This starts a server in the listening mode on the given url and parameters.
* Returns a source with events
* URL is required the format is protocol://host:port
* Parameters for the selected protocol is optional, when the selected protocols is not a shs protocol.

### listener.end
This closes the socket

### listener.push(msg,address)
This sends a network message on message-oriented protocols to a destination.

## network.combine(listen1,listen2,...)
This combines multiple network.listen to one source.
```javascript
var os = require('os')

var listener = network.combine(
  listen('tcp://localhost:8089'),
  listen('udp://0.0.0.0:8089',{reuseAddr:true,loopback:true,multicast:'239.5.5.5'}),
  listen('tcp+unix://'+os.tmpdir()+'/test4.socket')
)

_(listener,network.on({
  // all listener ready
  ready:function(e){
    // sends a string message over udp
    listener.push('ready')
    // connects to localhost
    network.connect('tcp://localhost:8089',function(err,connection){
    
    })
  },
  // incomming tcp connection
  connection:function(connection){
    _(['hello'],connection,_.drain(function(item){
      console.log(item)
    },function(err){
        if(err) return console.log(err)
    }))
  },
  // incomming udp message
  message:function(e){
    console.log(e)
  },
  end:function(err){

  }
}))

```

## network.protoNames()
* Returns a list of the supported protocols.

## network.register(name,connect,listen)
Register a custom protocol.
* Name of the protocol for example 'custom:'.
* For the custom connect and listen see in lib/tcp for example.

## License
MIT
