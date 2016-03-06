chai = require 'chai'
child_process = require 'child_process'
path = require 'path'

jsJobRun = (url, input, callback) ->
  prog = "./bin/jsjob-run"
  args = [
    url
  ]
  options = {}
  child_process.execFile prog, args, options, callback

example = (name) ->
  return path.join __dirname, '..', 'examples', name
fixture = (name) ->
  return path.join __dirname, 'fixtures', name

cliTimeout = 4000

describe.skip 'jsjob-run', ->
  describe "with job that errors", ->
    it 'should exit with non-zero code', (done) ->
      @timeout cliTimeout
      jsJobRun example('simple-failing.yaml'), (err) ->
        chai.expect(err).to.exist
        chai.expect(err.code).to.not.equal 0
        chai.expect(err.message).to.contain 'Command failed'
        done()
    it 'should write error message to stdout'

  describe "with job that passes", ->
    it 'should exit with 0 code', (done) ->
      @timeout cliTimeout
      jsJobRun example('simple-passing.yaml'), (err) ->
        chai.expect(err).to.not.exist
        done()
    it 'should write results to stdout'
