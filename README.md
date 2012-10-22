# po2json

[![Build Status](https://secure.travis-ci.org/mikeedwards/po2json.png?branch=master)](http://travis-ci.org/mikeedwards/po2json)
Pure Javascript implementation of Uniforum message translation. Based on a great gist.

## Getting Started
Install the module with: `npm install po2json`

### As a library
```javascript
var po2json = require('po2json');
```

### As an executable
```po2json translation.po translation.json```

## Documentation
_(Coming soon)_

## Examples

### Asynchronous Usage
```javascript
var po2json = require('po2json');
po2json.parse('messages.po', function (err, jsondata) {
    // do something interesting ...
})
```

### Synchronous Usage
```javascript
var po2json = require('po2json');
var jsondata = '';
try {
    jsondata = po2json.parseSync('messages.po');
    // do something interesting ...
} catch (e) {}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## Release History

0.0.5 / 2012-10-19
==================

  * cut out fake README example from grunt boilerplate (Mike Edwards)
  * fixed README.md markdown (Mike Edwards)
  * fixes tests (Mike Edwards)
  * added first test for parse_po (Mike Edwards)
  * Added boilerplate using grunt init (Mike Edwards)
  * Changed exports.parse to use node's convetional error-first callback style. Added exports.parseSync for synchronous parsing. (Dan MacTough)

0.0.4 / 2012-09-18
==================

  * Properly escape linebreaks (Zach Carter)
  * Update package.json (Mike Edwards)
  * package.json: define main module (Asbjørn Sloth Tønnesen)

0.0.2 / 2012-07-03
==================

  * fix package, fix pretty print return, remove debug logs (gilles)
  * upped version (Mike Edwards)

0.0.1 / 2012-06-06
==================

  * Added build status to README (Mike Edwards)
  * Removed built=ints from the dependencies (Mike Edwards)
  * Added a .travis file for continuous integration (Mike Edwards)
  * Added usage note to README.md (Mike Edwards)
  * First working script! (Mike Edwards)
  * Added new git repo (Mike Edwards)
  * initial commit (Mike Edwards)
  * Initial commit (Mike Edwards)

## License
Copyright (c) 2012 Joshua I. Miller  
Licensed under the GNU, Library, General, Public, License licenses.
