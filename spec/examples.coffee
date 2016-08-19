
{ jsJobRun } = require './cli'
path = require 'path'
chai = require 'chai'

testserver = 'http://localhost:8001'
example = (name) ->
  return path.join testserver, 'dist/examples', name

describe 'Examples: Sudoku', ->
  stdout = null
  stderr = null
  describe 'with a valid input board', ->
    it 'executes without error', (done) ->
      @timeout 4000
      # From http://www2.warwick.ac.uk/fac/sci/moac/people/students/peter_cock/python/sudoku
      board = '............942.8.16.....29........89.6.....14..25......4.......2...8.9..5....7..'
      jsJobRun example('sudoku.js'), { 'board': board }, (err, o, e) ->
        [stdout, stderr] = [o, e]
        chai.expect(err).to.not.exist
        done()
    it 'has a solution', () ->
      # correctness is ensured in the tests in finitedomain
      chai.expect(stdout).to.contain '"I9": 2'
