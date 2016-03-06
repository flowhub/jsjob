[![Build Status](https://travis-ci.org/the-grid/jsjob.svg?branch=master)](https://travis-ci.org/the-grid/jsjob)
# JsJob

Run arbitrary JavaScript code as jobs, in a browser-based sandbox.

Can be used for implementing distributed processing, or
allowing 3rd party 'plugins' in a cloud service.

## License
[MIT](./LICENSE.md)

## Status
**Version 1.x in progress**


## Installing

Get it from [NPM](https://www.npmjs.com/package/jsjob)

    npm install --save jsjob

## Usage

### Implement a JsJob plugin

A JsJob needs to implement a single function, `window.jsJobRun`:

    window.jsJobRun = function(inputdata, options, callback) {
      var err = null;
      var result = {'hello': 'jsjob'};
      var details = {'meta': 'data'}; // Can be used for information about the execution or results
      return callback(err, result, details);
    };

### Run programatically

    var jsjob = require('jsjob');

    var options = {};
    var runner = new jsjob.Runner(options);
    runner.start(function(err) {

      var pluginUrl = 'http://example.net/myjsjob.js'; // Something implementing JsJob API
      var inputData = {'bar': "baz"};
      var jobOptions = {};
      runner.runJob(pluginUrl, inputData, jobOptions, function(err, result, details) {

        runner.stop(function(err) { }); // one can have many runJob() calls for a single runner
      });
    });

### Run as script

[TODO](https://github.com/the-grid/jsjob/issues/1)

## Developing

Get the code

    git clone git@github.com:the-grid/jsjob.git

Run [the tests](./spec)

    npm test

Make release

    # change version in package.json
    git tag 1.x.y
    git push origin HEAD:master --tags
    # wait for Travis CI to do the rest
