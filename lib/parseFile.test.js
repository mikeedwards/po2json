const Jed = require("jed");
const MessageFormat = require("messageformat");
const po2json = require("../index");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

describe("parseFile", () => {
  it("parseFile", async (done) => {
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    await po2json.parseFile(__dirname + "/../test/fixtures/pl.po", null, function (_, parsed) {
      expect(parsed).toEqual(json);
      done();
    });
  });
});
