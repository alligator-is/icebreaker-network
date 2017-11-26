var test = require('tape')
var _ = require('icebreaker')
var listen = require('../../').listen
var connect = require('../../').connect
var on = require('../../').on
var os = require('os')
var serializer = require('pull-serializer')
var cl = require('chloride')
var goodbye = require('pull-goodbye')
var Abortable = require('pull-abortable')
var alice = cl.crypto_sign_keypair()
var bob = cl.crypto_sign_keypair()
var path = require('path')

function authenticate(id, cb) {
  cb(null, true, id.toString('base64') === alice.publicKey.toString('base64'))
}

function onConnection(t, l) {
  return function (c) {
    var abortable = Abortable()
    var a = _.pair()
    var b = _.pair()
  
    _(a, abortable, _.asyncMap(function (m, cb) {
      t.equal(m.toString(), 'hello')

      cb(null, 'world');
      setTimeout(function () {
        abortable.abort(true);
      }, 100)

    }), b)

    _(c, serializer(goodbye({ sink: a.sink, source: b.source })), c);
  }
}

function onConnect(t, l) {
  return function (err, connection) {
    t.notOk(err)

    var gb = serializer(goodbye({
      source: _.values(['hello']), sink: _.drain(function (data) {
        t.equal(data.toString(), 'world')
      }, function (err) {
        t.notOk(err)
        l.end();
      })
    }));

    _(gb, connection, gb);
  }
}


try {
  var utp = require('utp-native');
}
catch (err) {

}


test('shs+tcp v4', function (t) {
  t.plan(5)

  var l = listen('shs+tcp://localhost:5980/icebreaker@1.0.0', { keys:bob, authenticate: authenticate })

  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  }))
})

test('shs+tcp v6', function (t) {
  t.plan(5)

  var l = listen('shs+tcp://[::1]:5980/icebreaker@1.0.0', { keys: bob, authenticate: authenticate })

  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  }))
})

test('shs+tcp+unix', function (t) {
  t.plan(5)

  var l = listen('shs+tcp+unix://'+path.join("/",os.tmpdir() , '/test4.socket','/icebreaker@1.0.0'), { keys: bob, authenticate: authenticate })

  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  })) 
})


if (utp != null)
  test('shs+utp', function (t) {
    t.plan(5)

    var l = listen('shs+utp://localhost:5980/icebreaker@1.0.0', { keys: bob, authenticate: authenticate })

    _(l, on({
      ready: function (e) {
        connect(e.address, { keys: alice }, onConnect(t, l))
      },
      connection: onConnection(t, l),
      end: t.notOk
    }))
  })


test('shs+ws v4', function (t) {
  t.plan(5)

  var l = listen('shs+ws://localhost:5980/icebreaker@1.0.0', { keys: bob, authenticate: authenticate })

  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  }))
    
})

test('shs+ws v6', function (t) {
  t.plan(5)

  var l = listen('shs+ws://[::1]:5980/icebreaker@1.0.0', { keys: bob, authenticate: authenticate })

  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  }))
 
})

test('shs+ws+unix', function (t) {
  t.plan(5)

  var l = listen('shs+ws+unix://'+ path.join("/",os.tmpdir() , '/test4.socket','/icebreaker@1.0.0'), { keys: bob, authenticate: authenticate })
  
  _(l, on({
    ready: function (e) {
      connect(e.address, { keys: alice }, onConnect(t, l))
    },
    connection: onConnection(t, l),
    end: t.notOk
  }))
 
})
