chai = require 'chai'
child_process = require 'child_process'
path = require 'path'
debug = require('debug')('jsjob:test')

jsJobRun = (url, input, callback) ->
  prog = "./bin/jsjob-run"
  args = [
    url
  ]
  childOptions = {}
  cmd = prog + ' ' + args.join ' '
  debug 'running:', cmd
  child = child_process.execFile prog, args, childOptions, callback
  input = JSON.stringify input
  debug 'writing stdin', input
  child.stdin.end input, 'utf8' 
  return child

fixture = (name) ->
  testserver = 'http://localhost:8001'
  return path.join testserver, 'spec/fixtures/jsjobs', name

cliTimeout = 4000

describe 'jsjob-run', ->
  stdout = null
  stderr = null

  describe "with job that errors", ->
    it 'should exit with non-zero code', (done) ->
      @timeout cliTimeout
      jsJobRun fixture('return-error.js'), { 'input': 'data' }, (err, o, e) ->
        [stdout, stderr] = [o, e]
        chai.expect(err).to.exist
        chai.expect(err.code).to.not.equal 0
        chai.expect(err.message).to.contain 'Command failed'
        done()
    it 'should write error message to stderr', () ->
        chai.expect(stderr).to.include 'Error'
        chai.expect(stderr).to.include 'this is my error message'
    it 'should write error stack to stderr'

  describe "with job that passes", ->
    it 'should exit with 0 code', (done) ->
      @timeout cliTimeout
      jsJobRun fixture('return-input.js'), { 'original': 'input' }, (err, o, e) ->
        [stdout, stderr] = [o, e]
        chai.expect(err).to.not.exist
        done()
    it 'should write results to stdout', () ->
      chai.expect(stdout).to.include 'original'
      parsed = JSON.parse stdout
      chai.expect(parsed).to.have.keys ['original']
      chai.expect(parsed.original).to.equal 'input'

