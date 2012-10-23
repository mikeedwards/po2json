var po2json = require('../lib/po2json.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var input = "#: src/name.js:1\nmsgid \"My name is John.\\n\"\nmsgstr \"My name is Jean.\\n\"";

var expected_result = {
    "My name is John.\n": [
       null,
       "My name is Jean.\n"
    ],
    "": {}
};

var po_file = __dirname + '/fixtures/fr.po';

exports['parse_po'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'simple po': function(test) {
    var result = po2json.parse_po(input);
    test.expect(1);
    // tests here
    test.equal(result["My name is John.\n"][1],
      expected_result["My name is John.\n"][1],
      ' should match result.');
    test.done();
  }
};

exports['parse'] = {
  'asynchronously parse simple po': function(test) {
    test.expect(4);
    po2json.parse(po_file, function (err, result) {
      test.ifError(err);
      test.deepEqual(typeof result['fr'][""], 'object');
      test.deepEqual(Object.keys(result['fr'][""]).length, 0);
      test.deepEqual(result['fr']["My name is John.\n"][1], "My name is Jean.\n");
      test.done();
    });
  }
};
exports['parseSync'] = {
  'synchronously parse simple po': function(test) {
    test.expect(4);
    var result;
    test.doesNotThrow(function(){
      result = po2json.parseSync(po_file);
    });
    test.deepEqual(typeof result['fr'][""], 'object');
    test.deepEqual(Object.keys(result['fr'][""]).length, 0);
    test.deepEqual(result['fr']["My name is John.\n"][1], "My name is Jean.\n");
    test.done();
  }
};
