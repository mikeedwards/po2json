var _ = require("lodash");

/**
 * Parse PO buffer to JSON
 *
 * @param {Buffer|String} buffer - Buffer PO object or unicode string with PO data
 * @param {Object} [options]
 * @return {Object|String} Translation JSON
 */

module.exports = function(buffer, options) {

  // Setup options and load in defaults
  options = options || {};
  var defaults = {
    pretty: false,
    fuzzy: false,
    stringify: false,
    format: 'raw',
    domain: 'messages'
  };
  options = _.defaults( options, defaults );

  // Parse the PO file
  var parsed = require('gettext-parser').po.parse( buffer );

  // Create gettext/Jed compatible JSON from parsed data
  var result = {},
      contexts = parsed.translations;

  Object.keys(contexts).forEach(function (context) {
    var translations = parsed.translations[context];

    Object.keys(translations).forEach(function (key, i) {
      var t = translations[key],
          translationKey = context.length ? context + '\u0004' + key : key,
          fuzzy = t.comments && t.comments.flag === 'fuzzy';

      if (!fuzzy || options.fuzzy)
        result[translationKey] = [ t.msgid_plural ? t.msgid_plural : null ].concat(t.msgstr);

    });
  });

  // Attach headers (overwrites any empty translation keys that may have somehow gotten in)
  result[''] = parsed.headers;

  // Make JSON fully Jed-compatible
  if (options.format === 'jed') {
    var jed = {
      domain: options.domain,
      locale_data: {}
    };
    jed.locale_data[options.domain] = result;
    jed.locale_data[options.domain][''] = {
      domain: options.domain,
      plural_forms: result['']['plural-forms'],
      lang: result['']['language']
    };
    result = jed;
  }

  return options.stringify ? JSON.stringify( result, null, options.pretty ? '   ' : null ) : result;
}