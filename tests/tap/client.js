var newClient = require('../fixture.js');
var tap = require('tap');
var test = tap.test;
var pipeline = require('node-pipeline');

test('Client connect ', function(t) {
  var client = newClient(function(err) {

    t.notOk(err, 'Should not return error');
    t.ok(client._remote, 'Remote functions should exist');
    t.ok(client._remote.publish, 'Publish should exist');
    t.type(client._remote.publish, 'function', 'Publish should be function');
    t.ok(client._remote.subscribe, 'Subscribe should exist');
    t.type(client._remote.subscribe, 'function', 'Subscribe should be function');

    var tests = pipeline.create();
    tests.on('error', function() {});
    tests.on('step', function(name, action) {
      console.log(name);
    });

    // close connection at end of tests.
    tests.on('end', function(err, results) {
      var c = results[0].client;

      c.end(function() {
        t.ok(true, 'Socket closed');
        t.end();
      });

    });

    tests.use(function(results, next) {
        var c = results[0].client;

        c.ping(function(err) {
          t.notOk(err, 'Ping should return');
          next();
        });

    }, "Test Ping");

    tests.use(function(results, next) {
        var c = results[0].client;

        c.subscribe('foo', function(err) {
          t.notOk(err, 'Subscribe should return error');
          next();
        });
        
    }, "Add Subscribe event");

    tests.use(function(results, next) {
        var c = results[0].client;

        c.subscribe('poo', function(err) {
          t.notOk(err, 'Subscribe should return error');
          next();
        });
        
    }, "Add Subscribe event");


    tests.use(function(results, next) {
        var c = results[0].client,
            payload = { bar: 'baz' };

        c.publish('foo', payload,  function(err) {
          t.notOk(err, 'Subscribe should return error');
          if (err) {
            next(err);
          }
        });

        c.on('foo', function(response) {
          t.deepEqual(response.data, payload, 'Return payload should match original payload.');
          next();
        });
        
    }, "Listen for event");


    tests.use(function(results, next) {
        var c = results[0].client;

        c.unsubscribe('foo', function(err) {
          t.notOk(err, 'Unsubscribe should return error');
          next();
        });
        
    }, "Remove subscribe event");

    tests.execute({
      client: client
    });

  });
});






