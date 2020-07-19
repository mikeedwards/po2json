/**
 * Parse PO buffer to JSON
 *
 * @param {Buffer|String} buffer - Buffer PO object or unicode string with PO data
 * @param {Object} [options]
 * @return {Object|String} Translation JSON
 */
const g2m = require('gettext-to-messageformat');

module.exports = function (buffer, options) {

  // Setup options and load in defaults
  options = options || {};
  const defaults = {
    pretty: false,
    fuzzy: false,
    stringify: false,
    format: 'raw',
    domain: 'messages',
    charset: 'utf8',
    fullMF: false,
    mfOptions: {},
  };

  for (const property in defaults) {
    options[property] = 'undefined' !== typeof options[property] ? options[property] : defaults[property];
  }

  const mf = {};
  let mfTranslations = {};
  let result = {};

  // defer to gettext-to-messageformat for the 'mf' format option
  // use all g2m default replacements except for:   pattern: /[\\{}#]/g, replacement: '\\$&'
  if (options.format === 'mf') {
    const poString = buffer.toString();
    // if the Plural-Forms header is missing, g2m needs a function or will throw an error
    const mfOptions = (poString.includes('"Plural-Forms:')) ? options.mfOptions : Object.assign({}, {
      pluralFunction: () => 0
    }, options.mfOptions);
    result = Object.keys(mfOptions).length > 0 ? g2m.parsePo(buffer, mfOptions) : g2m.parsePo(buffer);

    if (options.fullMF) {
      return options.stringify ? JSON.stringify(result, null, options.pretty ? '   ' : null) : result;
    }

    // simplify the output to only return the translations
    if (result) {
      if (result['translations'] && result['translations']['']) {
        mfTranslations = result['translations'][''];
        // include the default translations at the top level to keep compatibility as much as possible
        Object.keys(result['translations']).forEach(function (context) {
          if (context === '') {
            Object.keys(result['translations']['']).forEach(function (key) {
              mfTranslations[key] = result['translations'][''][key];
            });
          } else {
            mfTranslations[context] = result['translations'][context];
          }
        })
      } else {
        mfTranslations = result['translations'] || {};
      }
    }

    return options.stringify ? JSON.stringify(mfTranslations, null, options.pretty ? '   ' : null) : mfTranslations;
  }

  // Parse the PO file
  const parsed = require('gettext-parser').po.parse(buffer, defaults.charset);

  // Create gettext/Jed compatible JSON from parsed data
  const contexts = parsed.translations;

  Object.keys(contexts).forEach(function (context) {
    const translations = parsed.translations[context];
    const pluralForms = parsed.headers ? parsed.headers['plural-forms'] : '';

    Object.keys(translations).forEach(function (key, i) {
      const t = translations[key],
        translationKey = context.length ? context + '\u0004' + key : key,
        fuzzy = t.comments && t.comments.flag && t.comments.flag.match(/fuzzy/) !== null;

      if (!fuzzy || options.fuzzy) {
        if (options.format === 'jed') {
          result[translationKey] = [t.msgid_plural ? t.msgid_plural : null].concat(t.msgstr);
        } else {
          if (pluralForms === 'nplurals=1; plural=0;') {
            msgstr = t.msgid_plural ? [t.msgstr] : t.msgstr;
            result[translationKey] = [t.msgid_plural ? t.msgid_plural : null].concat(msgstr);
          } else {
            result[translationKey] = [t.msgid_plural ? t.msgid_plural : null].concat(t.msgstr);
          }
        }
      }

      // In the case of fuzzy or empty messages, use msgid(/msgid_plural)
      if (options['fallback-to-msgid'] && (fuzzy && !options.fuzzy || t.msgstr[0] === '')) {
        result[translationKey] = [t.msgid_plural ? t.msgid_plural : null]
          .concat(t.msgid_plural ? [key, t.msgid_plural] : [key]);
      }

    });
  });

  // Attach headers (overwrites any empty translation keys that may have somehow gotten in)
  if (parsed.headers) {
    result[''] = parsed.headers;
  }

  if (options.format === 'mf') {
    delete result[''];
  }

  // Make JSON fully Jed-compatible
  if (options.format.indexOf('jed') === 0) {
    const jed = {
      domain: options.domain,
      locale_data: {}
    };
    if (options.format === 'jed') {
      for (const key in result) {
        if (result.hasOwnProperty(key) && key !== '') {
          for (let i = 2; i < result[key].length; i++) {
            if ('' === result[key][i]) {
              result[key][i] = result[key][0];
            }
          }
          result[key].shift();
        }
      }
    }
    jed.locale_data[options.domain] = result;
    jed.locale_data[options.domain][''] = {
      domain: options.domain,
      plural_forms: result['']['plural-forms'],
      lang: result['']['language']
    };

    result = jed;
  }

  return options.stringify ? JSON.stringify(result, null, options.pretty ? '   ' : null) : result;
};
