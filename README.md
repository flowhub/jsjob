[![Build Status](https://travis-ci.org/the-grid/jsjob.svg?branch=master)](https://travis-ci.org/the-grid/jsjob)
# JsJob

Run arbitrary JavaScript code as jobs, in a browser-based sandbox.

Can be used for implementing distributed processing, or
allowing 3rd party 'plugins' in a cloud service.

## License
[MIT](./LICENSE.md)

## Status
**In production**

* PhantomJS 2 (recommended) and PhantomJS supported
* Code used in production at [The Grid](http://thegrid.io) since March 2015

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
        console.log('jsjob returned', err, result, details);

        runner.stop(function(err) { }); // one can have many runJob() calls for a single runner
      });
    });

### Run as script

Basic example

    echo '{"input": "sss"}' | jsjob-run http:/localhost:8001/spec/fixtures/jsjobs/return-input.js
    # execute the .js file, and writes result (or error) to console
    {"input": "sss"}

Supported options

    Usage: jsjob-run [options] <job.js>

    Options:

      -h, --help           output usage information
      --port <portnumber>  Port to use for Runner HTTP server
      --timeout <seconds>  Number of seconds to limit job to
      --verbose [enable]   Verbose, logs console of job execution
      --joboptions <json>  Options to provide the job, as second argument of jsJobRun()
      --script <code>      JavaScript code injected before jsjob.js. Used for polyfills or API adapters

For an up-to-date list, use `jsjob-run --help`

## Developing

### Get the code

    git clone git@github.com:the-grid/jsjob.git

### Run [the tests](./spec)

    npm test

### File an issue

Check [existing list](https://github.com/the-grid/jsjob/issues) first.

### Make a pull request

Fork and [submit on Github](https://github.com/the-grid/jsjob/pulls)

### Make a release

    # change version in package.json
    git tag 1.x.y
    git push origin HEAD:master --tags
    # wait for Travis CI to do the rest
