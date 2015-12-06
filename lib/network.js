var _ = require('icebreaker');
var Notify = require('pull-notify')
var crypto=require('crypto');
var handshake = require('pull-handshake');

function Network(params) {
  var self = this;
  this.workgroup = params.workgroup || 'mhVJL4G237TMs76FEV5oRuq89L4sa5M5hmHXBOxMB3o=';
  this.id = params.id||crypto.randomBytes(32).toString('base64');
  this._notify = Notify()
  this._peers = {};
  var emit = this._emit = function(events,args){
    self._notify({event:events,args:args});
  }

  var listen = this._listen = this._notify.listen

  this.transports = [];
  this.transports = params.transports;

  _(listen(), _.drain(function (e) {
    if (e.event === 'started') {
      console.log('started',e.args.name,e.args.port);
      return;
    }
    else if (e.event === 'request') {
      self.transports.forEach(function (t) {
        t.emit(e.event, e.args);
      })
    }
    else if(e.event === 'connect'){
       self.transports.some(function(t){
          if(t.name === e.args.transport){
            t.connect(e.args);
              return true;
          }
         return false
       })
    }
    else if(e.event === 'connection'){
      var conn = e.args
      _(conn,self._handshake(self.id,function(stream,data){
        console.log('data',data);

      }),conn);

    }
  },function(){
     console.log('end');

  }));

  this.transports.forEach(function (t) {
    t.on('started', function () {
      emit('started',this);
    })
    .on('stopped', function () {
      emit('stopped',this);
    })
    .on('response', function (msg) {
      emit('response',msg);
    })
    .on('connection', function (connection) {
      emit('connection',connection);
    })
    .on('disconnected',function(connection){
      emit('disconnected',connection);
    });
  })
}

var proto = Network.prototype = {}

proto.start = function () {
  var self = this;
  this.transports.forEach(function (t) {
    self._emit('start',t)
    if (t.start) t.start();
  });
}

proto._handshake = function(local,cb){
  var stream = handshake(function (err) {
    if (err) console.error(err.message||err)
  })
  var shake = stream.handshake
  var l = Buffer.isBuffer(local)?local:new Buffer(local);
  var buf = new Buffer(4)
  buf.writeUInt32BE(l.length,0)
  shake.write(Buffer.concat([buf,l]));

  function error(err){
    if(err === true) return shake.abort(new Error('unexpected end of handshake stream'))
    return shake.abort(err)
  }

  shake.read(4, function (err, data) {
    if(err)return error(err)
    var len = data.readUInt32BE(0)
    shake.read(len, function (err, data) {
      if(err)return error(err)
      cb(shake.rest(), Buffer.isBuffer(data)?data.toString():data);
    })
  })


  return {
    source:stream.source,
    sink:_(
      _.asyncMap(function(data,cb){
        if(!Buffer.isBuffer(data))
          return cb(new Error('data must be a buffer, was: ' + JSON.stringify(data)))
        cb(null,data)
      }),
      stream.sink
    )
  }
}

proto.stop = function () {
  var self = this;
  this.transports.forEach(function (t) {
    self._emit('stop',t)
    if (t.stop) t.stop();
  });
}

proto.listen = function (event) {
  var listen = _.chain().add(this._listen())
  if (event) listen.filterNot(function (e) {
    return event === e
  })
  return listen
}

proto.connect = function (params) {
  var self = this;
  if(!params.address)throw new Error('Network::connect: address is required')
  if(!params.port)throw new Error('Network::connect: address is required')
  if(!params.transport)throw new Error('Network::connect: transport is required')
  if(!params.address)throw new Error('Network::connect: address is required')
  if(!this.transports.some(function(t){
    if(typeof t.connect ==='function')
    if(t.name === params.transport){
      self._emit('connect',params);
     return true;
    }
      return false;
  })) throw new Error('transport '+ params.transport +' not found');
}


module.exports = Network;
