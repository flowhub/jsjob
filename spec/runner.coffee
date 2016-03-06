jsjob = require '..'

chai = require 'chai' if not chai
fs = require 'fs'
path = require 'path'

local = (name) ->
  return "http://localhost:8001/spec/fixtures/jsjobs/#{name}.js"

describe 'Runner', ->
  solver = null
  solveroptions =
    timeout: null # set in beforeEach
    hardtimeout: null # set in beforeEach
    verbose: false

  before (done) ->
    solver = new jsjob.Runner solveroptions
    solver.start (err) ->
      chai.expect(err).to.be.a 'undefined'
      done()
  after (done) ->
    solver.stop (err) ->
      chai.expect(err).to.be.a 'undefined'
      done()

  beforeEach () ->
    solveroptions.hardtimeout = 8000
    solveroptions.timeout = 3500

  describe 'filter URL which gives 404', ->
    @timeout 4000 # TODO: fail faster?
    it 'should fail and return error', (done) ->
      filter = local '--non-existing--'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'window.jsJobRun'
        done()

  describe 'filter without window.jsJobRun', ->
    @timeout 4000 # TODO: fail faster?
    it 'should fail', (done) ->
      filter = local 'no-entrypoint'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'window.jsJobRun'
        done()

  describe 'filter returning error', ->
    it 'should fail and return the error', (done) ->
      filter = local 'return-error'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'this is my error'
        done()

  describe 'filter returning thrown error', ->
    it 'should fail and return the error with stacktrace', (done) ->
      filter = local 'return-thrown-error'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'this error was thrown'
        chai.expect(err.stack).to.contain 'mythrowingfunction'
        chai.expect(err.stack).to.contain 'return-thrown-error.js:3'
        done()

  describe 'filter never returning data', ->
    it 'should fail after timeout', (done) ->
      @timeout 4000
      filter = local 'never-returning'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'TIMEOUT'
        done()

  describe 'filter returning no solution and no error', ->
    it 'should fail and return error', (done) ->
      filter = local 'return-nothing'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.contain 'solution nor error'
        done()

  describe 'filter returning data multiple times', ->
    it 'should succeed and ignore everything but first data', (done) ->
      filter = local 'return-multiple'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.not.exist
        chai.expect(solution).to.equal 'my first data 1'
        done()

  describe 'filter throwing exception in jsJobRun', ->
    it 'should fail and return error', (done) ->
      @timeout 4000 # TODO: fail faster?
      filter = local 'throw-directly'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.an 'object'
        chai.expect(err.message).to.contain 'thrown in polySolvePage'
        done()

  describe 'filter throwing uncaught exception', ->
    it 'should fail and return error', (done) ->
      @timeout 4000 # TODO: fail faster?
      filter = local 'throw-indirectly'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.an 'object'
        chai.expect(err.message).to.contain 'thrown in a setTimeout'
        chai.expect(err.message).to.contain 'poly: main start'
        chai.expect(err.stack, 'stack should not duplicate message').to.not.contain 'poly: main start'
        done()

  describe 'filter returning data then throwing exception', ->
    # XXX: should maybe pass, but is an edge case, and hard to differentiate
    it 'should fail and return error with stacktrace', (done) ->
      filter = local 'callback-then-throw'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.an 'object'
        chai.expect(err.message).to.contain 'function'
        chai.expect(err.message).to.contain 'line'
        done()

  describe 'filter throwing exception then returning data', ->
    it 'should fail and return error with stacktrace', (done) ->
      filter = local 'throw-then-callback'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.an 'object'
        chai.expect(err.message).to.contain 'function'
        chai.expect(err.message).to.contain 'line'
        done()

  describe 'filter with infinite loop', ->
    it 'should timeout and return error', (done) ->
      @timeout 9000
      filter = local 'infinite-loop'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(solution).to.not.exist
        chai.expect(err).to.be.a 'object'
        chai.expect(err.message).to.include 'hard timeout'
        chai.expect(err.message).to.include 'logged before infinite loop'
        chai.expect(err.message).to.include 'poly: starting'
        chai.expect(err.stack, 'stack should not duplicate message').to.not.include 'poly: starting'
        done()

  describe 'passing options to filter', ->
    it 'should able to roundtrip back through details', (done) ->
      filter = local 'pass-options-in-details'
      page =
        config:
          color: 'red'
          layout: 'directed'
        items: []
      options =
        foo: 'foofoo'
        bar: 'barbaz'
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.be.a 'null'
        chai.expect(solution).to.be.a 'string'
        chai.expect(details.options).to.eql options
        done()

  describe 'sending "images" array as part of details', ->
    it 'should be returned so it can be stored', (done) ->
      filter = local 'details-images'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, details) ->
        chai.expect(err).to.not.exist
        chai.expect(solution).to.be.a 'string'
        chai.expect(details).to.include.keys 'images'
        chai.expect(details.images).to.have.length 2
        chai.expect(details.images[0]).to.contain 'imgflo.herokuapp.com/graph/'
        chai.expect(details.images[1]).to.contain 'imgflo.herokuapp.com/graph/'
        done()

  describe 'accessing a URL that fails to load', ->
    details = null
    it 'should return error from jsJobRun()', (done) ->
      filter = local 'script-load-error'
      page = ""
      options = {}
      solver.runJob filter, page, options, (err, solution, d) ->
        details = d
        chai.expect(err).to.exist
        chai.expect(err.message).to.include 'script load error'
        done()

    it 'details.stdout should contain error', () ->
      chai.expect(details.stdout).to.include 'resource error'
      chai.expect(details.stdout).to.include '203'
      chai.expect(details.stdout).to.include 'thegrid.io/non-existant.js'

  describe 'specifying a resource whitelist in options', ->
    details = null
    it 'should return blocked error', (done) ->
      filter = local 'script-load-blocked'
      page = ""
      options =
        allowedResources: [
          'http://ajax.googleapis.com'
        ]
      solver.runJob filter, page, options, (err, solution, d) ->
        details = d
        chai.expect(err).to.exist
        chai.expect(err.message).to.include 'Failed to load script'
        done()

    it 'details.stdout should contain blocked log', () ->
      chai.expect(details.stdout).to.include 'blocked resource'
      chai.expect(details.stdout).to.include 'cdn.thegrid.io/design-systems/helloworld'

    it 'details.stdout should not contain resource error for blocked request', () ->
      chai.expect(details.stdout).to.not.include 'resource error'

  describe 'jsjob requesting a screenshot', ->
    details = null
    pngMagic = new Buffer "PNG\r\n", 'utf8'

    it.skip 'should be stored in details as base64 PNG dataurl', (done) -> # feature disabled
      @timeout 4000
      filter = local 'take-screenshots'
      page = {}
      options = {}
      solver.runJob filter, page, options, (err, solution, d) ->
        details = d
        chai.expect(err).to.not.exist
        chai.expect(details.screenshots).to.have.keys ['myname']
        dataurl = details.screenshots.myname
        chai.expect(dataurl).to.contain 'data:image/png'
        chai.expect(dataurl).to.contain 'base64,'
        data = dataurl.slice(dataurl.indexOf(',')+1)
        decoded = new Buffer(data, 'base64')
        chai.expect(decoded.toString('ascii')).to.contain pngMagic.toString('ascii')
        done()

    it 'should be empty in details', (done) ->
      @timeout 4000
      filter = local 'take-screenshots'
      page = {}
      options = {}
      solver.runJob filter, page, options, (err, solution, d) ->
        details = d
        chai.expect(err).to.not.exist
        chai.expect(details.screenshots).to.eql {}
        done()

