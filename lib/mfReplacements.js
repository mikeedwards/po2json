/**
 * All of the gettext-to-messageformat default replacements except for
 * {pattern: /[\\{}#]/g, replacement: '\\$&'}, which escapes braces, hashes and
 * backslashes so MessageFormat reads them as literals.
 *
 * Used when the `escape-params` option is off, to keep placeholders such as
 * {{error}} as they were written (see issue #77). Also exported as
 * `po2json.mfReplacements` to build a replacement list of your own from.
 */
module.exports = [
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
    state: {n: 0}
  },
  {
    pattern: /%%/g,
    replacement: '%'
  }
];
