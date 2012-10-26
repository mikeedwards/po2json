/*
PO parser from http://jsgettext.berlios.de/lib/Gettext.js
adapted for Node.js and modified to be more like po2json.pl
- Zach Carter <zcarter@cse.usf.edu>

Further adapted to be used inside a node.js environment instead of the command line. Import with a require statement:
var po2json = require('po2json.js')
po2json.parse('filename', function(result) {
   on parse complete callback, result is the json string.
});
- Daniel Roberts <danielrobertsdesign@gmail.com>
*/

/*
Pure Javascript implementation of Uniforum message translation.
Copyright (C) 2008 Joshua I. Miller <unrtst@cpan.org>, all rights reserved

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU Library General Public License as published
by the Free Software Foundation; either version 2, or (at your option)
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Library General Public License for more details.

You should have received a copy of the GNU Library General Public
License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307,
USA.
*/

var fs = require('fs'),
  path = require('path'),

  context_glue = "\004",

  parse_po_dequote = function(str) {
    "use strict";
    var match;
    if (match = str.match(/^"(.*)"/)) {
      str = match[1];
    }
    str = str.replace(/\\"/g, '"')
             .replace(/\\n/g, '\n');
    return str;
  },

  parse_po = function (data) {
    "use strict";
    var rv = {},
      buffer = {},
      lastbuffer = "",
      errors = [],
      lines = data.split("\n"),
      i,
      str,
      pos,
      key,
      val,
      match,
      msg_ctxt_id,
      msgid_plural,
      trans,
      cur,
      hlines;

    for (i=0; i<lines.length; i++) {
      // chomp
      lines[i] = lines[i].replace(/(\n|\r)+$/, '');

      // Empty line / End of an entry.
      if (/^$/.test(lines[i])) {
        if (typeof(buffer['msgid']) !== 'undefined') {
          msg_ctxt_id = (typeof(buffer['msgctxt']) !== 'undefined' &&
                            buffer['msgctxt'].length) ?
                              buffer['msgctxt']+context_glue+buffer['msgid'] :
                              buffer['msgid'];
          msgid_plural = (typeof(buffer['msgid_plural']) !== 'undefined' &&
                              buffer['msgid_plural'].length) ?
                                buffer['msgid_plural'] :
                                null;

          // find msgstr_* translations and push them on
          trans = [];
          for (str in buffer) {
            if (match = str.match(/^msgstr_(\d+)/)) {
              trans[parseInt(match[1], 10)] = buffer[str];
            }
          }
          trans.unshift(msgid_plural);

          // only add it if we've got a translation
          // NOTE: this doesn't conform to msgfmt specs
          if (trans.length > 1) {
            rv[msg_ctxt_id] = trans;
          }

          buffer = {};
          lastbuffer = "";
        }

      // comments
      } else if (/^(#[^~]|#$)/.test(lines[i])) {
        continue;

      // msgctxt
      } else if (match = lines[i].match(/^(?:#~ )?msgctxt\s+(.*)/)) {
        lastbuffer = 'msgctxt';
        buffer[lastbuffer] = parse_po_dequote(match[1]);

      // msgid
      } else if (match = lines[i].match(/^(?:#~ )?msgid\s+(.*)/)) {
        lastbuffer = 'msgid';
        buffer[lastbuffer] = parse_po_dequote(match[1]);

      // msgid_plural
      } else if (match = lines[i].match(/^(?:#~ )?msgid_plural\s+(.*)/)) {
        lastbuffer = 'msgid_plural';
        buffer[lastbuffer] = parse_po_dequote(match[1]);

      // msgstr
      } else if (match = lines[i].match(/^(?:#~ )?msgstr\s+(.*)/)) {
        lastbuffer = 'msgstr_0';
        buffer[lastbuffer] = parse_po_dequote(match[1]);

      // msgstr[0] (treak like msgstr)
      } else if (match = lines[i].match(/^(?:#~ )?msgstr\[0\]\s+(.*)/)) {
        lastbuffer = 'msgstr_0';
        buffer[lastbuffer] = parse_po_dequote(match[1]);

      // msgstr[n]
      } else if (match = lines[i].match(/^(?:#~ )?msgstr\[(\d+)\]\s+(.*)/)) {
        lastbuffer = 'msgstr_'+match[1];
        buffer[lastbuffer] = parse_po_dequote(match[2]);

      // continued string
      } else if (/^(?:#~ )?"/.test(lines[i])) {
        buffer[lastbuffer] += parse_po_dequote(lines[i]);

      // something strange
      } else {
        errors.push("Strange line ["+i+"] : "+lines[i]);
      }
    }


    // handle the final entry
    if (typeof(buffer['msgid']) !== 'undefined') {
      msg_ctxt_id = (typeof(buffer['msgctxt']) !== 'undefined' &&
                        buffer['msgctxt'].length) ?
                          buffer['msgctxt']+context_glue+buffer['msgid'] :
                          buffer['msgid'];
      msgid_plural = (typeof(buffer['msgid_plural']) !== 'undefined' &&
                         buffer['msgid_plural'].length) ?
                           buffer['msgid_plural'] :
                           null;

      // find msgstr_* translations and push them on
      trans = [];
      for (str in buffer) {
        if (match = str.match(/^msgstr_(\d+)/)) {
          trans[parseInt(match[1], 10)] = buffer[str];
        }
      }
      trans.unshift(msgid_plural);

      // only add it if we've got a translation
      // NOTE: this doesn't conform to msgfmt specs
      if (trans.length > 1) {
        rv[msg_ctxt_id] = trans;
      }

      buffer = {};
      lastbuffer = "";
    }


    // parse out the header
    if (rv[""] && rv[""][1]) {
      cur = {};
      hlines = rv[""][1].split(/\n/);
      for (i=0; i<hlines.length; i++) {
        if (! hlines[i].length) {
          continue;
        }

        pos = hlines[i].indexOf(':', 0);
        if (pos !== -1) {
          key = hlines[i].substring(0, pos);
          val = hlines[i].substring(pos +1);

          if (cur[key] && cur[key].length) {
            errors.push("SKIPPING DUPLICATE HEADER LINE: "+hlines[i]);
          } else if (/#-#-#-#-#/.test(key)) {
            errors.push("SKIPPING ERROR MARKER IN HEADER: "+hlines[i]);
          } else {
            cur[key] = val.trim(); // strip leading and trailing space
          }

        } else {
          errors.push("PROBLEM LINE IN HEADER: "+hlines[i]);
          cur[hlines[i]] = '';
        }
      }

      // replace header string with assoc array
      rv[""] = cur;
    } else {
      rv[""] = {};
    }

    // TODO: XXX: if there are errors parsing, what do we want to do?
    // GNU Gettext silently ignores errors. So will we.
    // alert( "Errors parsing po file:\n" + errors.join("\n") );
    if (errors.length) {
      console.warn(errors.join("\n"));
    }

    return rv;
  },

  parse = function (file, options, callback) {
    "use strict";
    options = options || {};
    if ('function' === typeof options) {
      callback = options;
      options = {};
    }
    if (!('pretty' in options)) {
      options.pretty = true;
    }
    fs.realpath(file, function (err, realfile) {
      if (err) {
        return callback(err);
      }
      fs.readFile(realfile, 'utf8', function (err, data) {
        var result = {};
        if (err) {
          return callback(err);
        }
        try {
          result[path.basename(file, '.po')] = parse_po(data);
        } catch (e) {
          return callback(e);
        }
        process.nextTick(function(){
          if (!options.stringify) {
            callback(null, result);
          } else if (options.pretty) {
            // perl JSON encoder uses three spaces (╯°□°）╯︵ ┻━┻
            callback(null, JSON.stringify(result, null, '   '));
          } else {
            callback(null, JSON.stringify(result));
          }
        });
      });
    });
  },

  parseSync = function (file, options) {
    "use strict";
    var data = fs.readFileSync(fs.realpathSync(file), 'utf8'),
      result = {};

    options = options || {};
    if (!('pretty' in options)) {
      options.pretty = true;
    }

    // Allow this to throw
    result[path.basename(file, '.po')] = parse_po(data);
    if (!options.stringify) {
      return result;
    } else if (options.pretty) {
      // perl JSON encoder uses three spaces (╯°□°）╯︵ ┻━┻
      return JSON.stringify(result, null, '   ');
    } else {
      return JSON.stringify(result);
    }
  };

module.exports.parse = parse;
module.exports.parse_po = parse_po;
module.exports.parseSync = parseSync;

