const fs = require("fs/promises"),
  Jed = require("jed"),
  MessageFormat = require("messageformat"),
  po2json = require("../index");

describe("parseFileSync", () => {
  it("parseFileSync", async () => {
    const json = await JSON.parse(await fs.readFile(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    const parsed = po2json.parseFileSync(__dirname + "/../test/fixtures/pl.po", null);
    expect(parsed).toEqual(json);
  });
});
