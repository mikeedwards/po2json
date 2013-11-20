var po2json = require(".."),
    fs = require("fs"),
    Jed = require("jed");

module.exports["parse"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po);
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse with Jed format"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl-jed.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'jed' });
    test.deepEqual(parsed, this.json);
    test.doesNotThrow(function() { new Jed(parsed) }, Error)
    test.done();
  }
}

module.exports["parseFile"] = {
  setUp: function(callback){
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl.json", "utf-8"));
    callback();
  },

  parseFile: function(test){
    var self = this;
    po2json.parseFile(__dirname + "/fixtures/pl.po", null, function (err, parsed) {
      test.deepEqual(parsed, self.json);
      test.done();
    });
  }
}

module.exports["parseFileSync"] = {
  setUp: function(callback){
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl.json", "utf-8"));
    callback();
  },

  parseFileSync: function(test){
    var parsed = po2json.parseFileSync(__dirname + "/fixtures/pl.po");
    test.deepEqual(parsed, this.json);
    test.done();
  }
}
