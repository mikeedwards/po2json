const fs = require("fs/promises"),
  Jed = require("jed"),
  MessageFormat = require("messageformat"),
  po2json = require("../index");

describe("parseFile", () => {
  it("parseFile", async (done) => {
    const json = await JSON.parse(await fs.readFile(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    await po2json.parseFile(__dirname + "/../test/fixtures/pl.po", null, function (_, parsed) {
      expect(parsed).toEqual(json);
      done();
    });
  });
});
