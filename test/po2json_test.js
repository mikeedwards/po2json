var po2json = require(".."),
    fs = require("fs"),
    Jed = require("jed"),
    MessageFormat = require("messageformat");

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

module.exports["parse with old Jed format"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl-jedold.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'jedold' });
    test.deepEqual(parsed, this.json);
    test.doesNotThrow(function() { new Jed(parsed) }, Error)
    test.done();
  }
};

module.exports["parse with current Jed format"] = {
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
};

module.exports["parse with MessageFormatter format"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl-mf.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse with MessageFormatter and compile successfully"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    callback();
  },

  parse: function(test){
    var translations = po2json.parse(this.po, { format: 'mf' });
    var f = function (n) {
      return (n==1 ? 'p0' : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 'p1' : 'p2');
    };
    f.cardinal = [ 'p0', 'p1', 'p2' ];
    var mf = new MessageFormat(
      {
        'pl': f
      }
    );
    var messages = mf.compile(translations);
    test.equal(messages['A sentence with "quotation" marks.']({}), "Zdanie w \"cudzysłowie\".");
    test.equal(messages['one product']([1]), 'jeden produkt');
    test.equal(messages['one product']([2]), '2 produkty');
    test.equal(messages['one product']([12]), '12 produktów');
    test.equal(messages['one product']([22]), '22 produkty');
    test.equal(messages['string context']['the contextual phrase']({}), 'zwrot kontekstowe');
    test.done();
  }
}

module.exports["parse with full MessageFormatter format"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/pl-mf-full.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf', fullMF: true });
    test.deepEqual(parsed.headers, this.json.headers);
    test.deepEqual(parsed.translations, this.json.translations);
    test.done();
  }
}

module.exports["parse with full MessageFormatter format and get plural function"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf', fullMF: true });
    test.ok(parsed.pluralFunction);
    test.equal(typeof parsed.pluralFunction, 'function');
    test.done();
  }
}

module.exports["parse with full MessageFormatter and compile successfully"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/pl.po");
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf', fullMF: true });
    var locale = {};
    locale[parsed.headers.language] = parsed.pluralFunction;
    var mf = new MessageFormat(locale);
    var messages = mf.compile(parsed.translations);
    test.equal(messages['']['A sentence with "quotation" marks.']({}), "Zdanie w \"cudzysłowie\".");
    test.equal(messages['']['one product']([1]), 'jeden produkt');
    test.equal(messages['']['one product']([2]), '2 produkty');
    test.equal(messages['']['one product']([12]), '12 produktów');
    test.equal(messages['']['one product']([22]), '22 produkty');
    test.equal(messages['string context']['the contextual phrase']({}), 'zwrot kontekstowe');
    test.done();
  }
}

module.exports["parse with MessageFormatter format + fallback-to-msgid"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/en-empty.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/en-mf-fallback-to-msgid.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf', 'fallback-to-msgid': true });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse with fallback-to-msgid"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/en-empty.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/en-empty.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { 'fallback-to-msgid': true });
    test.deepEqual(parsed, this.json);
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

module.exports["parse with Plural-Forms == nplurals=1; plural=0;"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/ja.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/ja.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po);
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse with Plural-Forms == nplurals=1; plural=0; and with the current Jed format"] = {
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/ja.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/ja-jed.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'jed' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse with no headers"] ={
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/en-no-header.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/en-no-header.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po);
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse raw JSON context correctly"] ={
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/es-context.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/es-context.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'raw' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse jed < 1.1.0 context correctly"] ={
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/es-context.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/es-context-jedold.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'jedold' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse jed >= 1.1.0 context correctly"] ={
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/es-context.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/es-context-jed.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'jed' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["parse mf context correctly"] ={
  setUp: function(callback){
    this.po = fs.readFileSync(__dirname + "/fixtures/es-context.po");
    this.json = JSON.parse(fs.readFileSync(__dirname + "/fixtures/es-context-mf.json", "utf-8"));
    callback();
  },

  parse: function(test){
    var parsed = po2json.parse(this.po, { format: 'mf' });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}

module.exports["handle braces in mf with messageformat options"] ={
  setUp: function(callback){
    this.po = `
      msgid "test"
      msgstr "Hi %{firstname}"
    `;
    //this.json = JSON.parse(`{ "test": "Hi %\\\\{firstname\\\\}" }`);
    this.json = JSON.parse(`{ "test": "Hi %{firstname}" }`);
    callback();
  },

  parse: function(test){
    const mfOptions = {
      replacements: [
        {
          pattern: /%(\d+)(?:\$\w)?/g,
          replacement: (_, n) => `{${n - 1}}`
        },
        {
          pattern: /%\((\w+)\)\w/g,
          replacement: '{$1}'
        },
        {
          pattern: /%\w/g,
          replacement: function () { return `{${this.n++}}` },
          state: { n: 0 }
        },
        {
          pattern: /%%/g,
          replacement: '%'
        }
      ]
    };

    var parsed = po2json.parse(this.po, { format: 'mf', mfOptions: mfOptions });
    test.deepEqual(parsed, this.json);
    test.done();
  }
}
