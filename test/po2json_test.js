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

input = "#: src/name.js:1\nmsgid \"My name is John.\\n\"\nmsgstr \"My name is Jean.\\n\""

expected_result = {
    "My name is John.\n": [
       null,
       "My name is Jean.\n"
    ],
    "": {}
 }


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
