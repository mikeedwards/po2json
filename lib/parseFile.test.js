const Jed = require("jed");
const MessageFormat = require("messageformat");
const po2json = require("../index");
const fs = require("fs");

describe("parseFile", () => {
  it("parseFile", (done) => {
    const json = JSON.parse(fs.readFileSync(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    po2json.parseFile(__dirname + "/../test/fixtures/pl.po", null, function (_, parsed) {
      expect(parsed).toEqual(json);
      done();
    });
  });
});
