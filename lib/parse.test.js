const Jed = require("jed");
const MessageFormat = require("@messageformat/core");
const po2json = require("../index");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

// messageformat >= 3 compiles a single message at a time, so walk the
// (possibly context-nested) translations and compile them one by one
const compileAll = (mf, translations) => Object.keys(translations)
  .reduce((messages, key) => {
    const message = translations[key];
    messages[key] = typeof message === "string" ? mf.compile(message) : compileAll(mf, message);
    return messages;
  }, {});

describe("parse", () => {

  it("parse", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    const parsed = po2json.parse(po);
    expect(parsed).toEqual(json);
  });

  it("parse with old Jed format", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl-jedold.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'jedold'});
    expect(parsed).toEqual(json);
    expect(() => {
      new Jed(parsed)
    }).not.toThrow(Error);
  });

  it("parse with current Jed format", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl-jed.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'jed'});
    expect(parsed).toEqual(json);
    expect(() => {
      new Jed(parsed)
    }).not.toThrow(Error);
  });

  it("parse with MessageFormatter format", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl-mf.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'mf'});
    expect(parsed).toEqual(json);
  });

  it("parse with MessageFormatter and compile successfully", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const translations = await po2json.parse(po, {format: 'mf'});

    const pl = (n) => {
      return (n === 1 ? 'p0' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'p1' : 'p2');
    };
    pl.cardinals = ['p0', 'p1', 'p2'];
    const mf = new MessageFormat(pl);
    const messages = compileAll(mf, translations);
    expect(messages['A sentence with "quotation" marks.']({})).toEqual("Zdanie w \"cudzysłowie\".");
    expect(messages['one product']([1])).toEqual('jeden produkt');
    expect(messages['one product']([2])).toEqual('2 produkty');
    expect(messages['one product']([12])).toEqual('12 produktów');
    expect(messages['one product']([22])).toEqual('22 produkty');
    expect(messages['string context']['the contextual phrase']({})).toEqual('zwrot kontekstowe');
  });

  it("parse with full MessageFormatter format", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl-mf-full.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'mf', fullMF: true});
    expect(parsed.headers).toEqual(json.headers);
    expect(parsed.translations).toEqual(json.translations);
  });

  it("parse with full MessageFormatter format and get plural function", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl-mf-full.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'mf', fullMF: true});
    expect(parsed.pluralFunction).toBeTruthy();
    expect(typeof parsed.pluralFunction).toBe('function');
  });

  it("parse with full MessageFormatter and compile successfully", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/pl.po");
    const parsed = await po2json.parse(po, {format: 'mf', fullMF: true});

    const mf = new MessageFormat(parsed.pluralFunction);
    const messages = compileAll(mf, parsed.translations);

    expect(messages['']['A sentence with "quotation" marks.']({})).toEqual("Zdanie w \"cudzysłowie\".");
    expect(messages['']['one product']([1])).toEqual('jeden produkt');
    expect(messages['']['one product']([2])).toEqual('2 produkty');
    expect(messages['']['one product']([12])).toEqual('12 produktów');
    expect(messages['']['one product']([22])).toEqual('22 produkty');
    expect(messages['string context']['the contextual phrase']({})).toEqual('zwrot kontekstowe');
  });

  it("parse with MessageFormatter format + fallback-to-msgid", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/en-empty.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/en-mf-fallback-to-msgid.json", "utf-8"));

    const parsed = po2json.parse(po, {format: 'mf', 'fallback-to-msgid': true});
    expect(parsed).toEqual(json);
  });

  it("parse with fallback-to-msgid", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/en-empty.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/en-empty.json", "utf-8"));
    const parsed = po2json.parse(po, {'fallback-to-msgid': true});
    expect(parsed).toEqual(json);
  });

  it("parse with Plural-Forms == nplurals=1; plural=0;", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/ja.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/ja.json", "utf-8"));
    const parsed = po2json.parse(po);
    expect(parsed).toEqual(json);
  });

  it("parse with Plural-Forms == nplurals=1; plural=0; and with the current Jed format", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/ja.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/ja-jed.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'jed'});
    expect(parsed).toEqual(json);
  });

  it("parse with no headers", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/en-no-header.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/en-no-header.json", "utf-8"));
    const parsed = po2json.parse(po);
    expect(parsed).toEqual(json);
  });

  it("parse with raw JSON context correctly", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/es-context.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/es-context.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'raw'});
    expect(parsed).toEqual(json);
  });

  it("parse with jed < 1.1.0 context correctly", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/es-context.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/es-context-jedold.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'jedold'});
    expect(parsed).toEqual(json);
  });

  it("parse with jed >= 1.1.0 context correctly", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/es-context.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/es-context-jed.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'jed'});
    expect(parsed).toEqual(json);
  });

  it("parse with MessageFormat context correctly", async () => {
    const po = await readFile(__dirname + "/../test/fixtures/es-context.po");
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/es-context-mf.json", "utf-8"));
    const parsed = po2json.parse(po, {format: 'mf'});
    expect(parsed).toEqual(json);
  });

  it("handle braces in mf with messageformat options", async () => {
    this.po = `
      msgid "test"
      msgstr "Hi %{firstname}"
    `;
    //this.json = JSON.parse(`{ "test": "Hi %\\\\{firstname\\\\}" }`);
    this.json = await JSON.parse(`{ "test": "Hi %{firstname}" }`);

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
          replacement: function () {
            return `{${this.n++}}`
          },
          state: {n: 0}
        },
        {
          pattern: /%%/g,
          replacement: '%'
        }
      ]
    };

    const parsed = po2json.parse(this.po, {format: 'mf', mfOptions: mfOptions});
    expect(parsed).toEqual(this.json);
  });

  // gettext-to-messageformat escapes braces, hashes and backslashes so that
  // MessageFormat reads them as literals, 'escape-params' turns that off (issue #77)
  it("escape braces in mf by default", async () => {
    const po = `
      msgid "Unable to register cause:"
      msgstr "Unable to register cause: {{error}}"
    `;

    const parsed = po2json.parse(po, {format: 'mf'});
    expect(parsed).toEqual({"Unable to register cause:": "Unable to register cause: \\{\\{error\\}\\}"});
  });

  it("leave braces in mf untouched without escape-params", async () => {
    const po = `
      msgid "Unable to register cause:"
      msgstr "Unable to register cause: {{error}}"
    `;

    const parsed = po2json.parse(po, {format: 'mf', 'escape-params': false});
    expect(parsed).toEqual({"Unable to register cause:": "Unable to register cause: {{error}}"});
  });

  it("keep replacing placeholders in mf without escape-params", async () => {
    const po = `
      msgid "%s bought %d products for %%"
      msgstr "%s bought %d products for %%"
    `;

    const parsed = po2json.parse(po, {format: 'mf', 'escape-params': false});
    expect(parsed).toEqual({"%s bought %d products for %%": "{0} bought {1} products for %"});
  });

  it("let messageformat options win over escape-params", async () => {
    const po = `
      msgid "Unable to register cause:"
      msgstr "Unable to register cause: {{error}}"
    `;

    const mfOptions = {
      replacements: [{pattern: /[\\{}#]/g, replacement: '\\$&'}].concat(po2json.mfReplacements)
    };

    const parsed = po2json.parse(po, {format: 'mf', 'escape-params': false, mfOptions: mfOptions});
    expect(parsed).toEqual({"Unable to register cause:": "Unable to register cause: \\{\\{error\\}\\}"});
  });
});
