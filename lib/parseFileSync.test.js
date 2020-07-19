const Jed = require("jed");
const MessageFormat = require("messageformat");
const po2json = require("../index");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

describe("parseFileSync", () => {
  it("parseFileSync", async () => {
    const json = await JSON.parse(await readFile(__dirname + "/../test/fixtures/pl.json", "utf-8"));
    const parsed = po2json.parseFileSync(__dirname + "/../test/fixtures/pl.po", null);
    expect(parsed).toEqual(json);
  });
});
