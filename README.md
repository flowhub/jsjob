[![Build Status](https://travis-ci.org/flowhub/jsjob.svg?branch=master)](https://travis-ci.org/flowhub/jsjob)
# JsJob

Run arbitrary JavaScript code as jobs, in a browser-based sandbox.

Especially designed for medium to large-sized computations with no or limited access
to external services, which does not need to syncronize with other computations.
Persistence of data is handled outside the job itself.
This architecture makes for services which are easy to distribute and scale.

Usecases include

* Having 'plugins' for a backend/service with well-defined interface and isolation.
Independent deploys and faster change-around times, without having to build a microservice.
Possibility of allowing 3rd-party extensions.
* Peer-to-peer distributed processing, across both servers and browsers.
* Sandboxed execution of native (C/C++ etc) code, by compiling to JS via Emscripten or similar.
* Building compute-heavy services, including backend, in a frontend/browser-first manner.

## License
[MIT](./LICENSE.md)

## Status
**In production**

* PhantomJS 2.0 (recommended) and PhantomJS 1.x supported
* Code used in production at [The Grid](http://thegrid.io) since March 2015

## Roadmap

[2.x](https://github.com/flowhub/jsjob/milestones/2.x)

* Support for SlimerJS/Gecko and WebDriver
* WebWorker and client-side runner support

## Related projects

* [noflo-jsjob](https://github.com/noflo/noflo-jsjob) makes it easy to use JsJob in [NoFlo](http://noflojs.org/) applications,
and create distributed workers over AMQP/RabbitMQ or MQTT when combined with [noflo-msgflo](http://github.com/noflo/noflo-runtime-msgflo).
* [jsjob-ethereum](https://github.com/flowhub/jsjob-ethereum) is an experiement for a decentralized
computation market using the [Ethereum](https://www.ethereum.org/) blockchain.
* ... Let us know about your project, and we'll link it here!

## Installing

Get it from [NPM](https://www.npmjs.com/package/jsjob)

    npm install --save jsjob

Install PhantomJS 2.x (recommended),
either [from upstream](http://phantomjs.org/download.html) or using your OS package manager.

    http://phantomjs.org/download.html

Alternatively, get PhantomJS 1.x from NPM

    npm install --save phantomjs

## [Examples](./examples)

### Sudoku solver

[Solver code](./examples/sudoku.coffee) |
[JsJob plugin](./examples/sudoku.js) |
[Input format](http://www2.warwick.ac.uk/fac/sci/moac/people/students/peter_cock/python/sudoku/)

    echo '{"board":".94...13..............76..2.8..1.....32.........2...6.....5.4.......8..7..63.4..8"}' | jsjob-run https://flowhub.github.io/jsjob/examples/sudoku.js

## Usage

### Implement a JsJob plugin

A JsJob needs to implement a single function, `window.jsJobRun`:

    window.jsJobRun = function(inputdata, options, callback) {
      var err = null;
      var result = {'hello': 'jsjob'};
      var details = {'meta': 'data'}; // Can be used for information about the execution or results
      return callback(err, result, details);
    };

This should be bundled into a self-contained (no external dependencies) `.js` bundle.
For non-trivial code, we recommend using NPM modules for dependencies, and building with
[Webpack](https://webpack.github.io/) or [Browserify](http://browserify.org/).

Serve the `.js` file from a HTTP file-server, which the runner has access to.
Locally you can use `simple-server` from NPM.
For publically accessible URL, you can use Github Pages, Amazon S3 or similar.

When deploying to a public server, use SSL/HTTPS!

### Run programatically

    var jsjob = require('jsjob');

    var options = {};
    var runner = new jsjob.Runner(options);
    runner.start(function(err) {

      var pluginUrl = 'https://example.net/myjsjob.js'; // Something implementing JsJob API
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

Will execute the .js file in browser sandbox with the given data,
and then writes result (or error) to the console.

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

    git clone git@github.com:flowhub/jsjob.git

### Run [the tests](./spec)

    npm test

### File an issue

Check the [existing list](https://github.com/flowhub/jsjob/issues) first.

### Make a pull request

Fork and [submit on Github](https://github.com/flowhub/jsjob/pulls)

### Make a release

    # change version in package.json
    git tag 1.x.y
    git push origin HEAD:master --tags
    # wait for Travis CI to do the rest
