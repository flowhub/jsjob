Runner = require './runner'

collectStdin = (callback) ->
  data = ""

  process.stdin.on 'data', (chunk) ->
    data += chunk.toString()
  process.stdin.on 'end', () ->
    return callback null, data

waitForInputAndRun = (runner, options, callback) ->
  collectStdin (err, str) ->
    return callback err if err

    parsed = null
    try
      parsed = JSON.parse str
    catch e
      return callback e

    jobOptions = options.joboptions
    runner.runJob options.codeurl, parsed, options, callback

runJob = (options, callback) ->
  runner = new Runner options
  runner.start (err) ->
    return callback err if err

    waitForInputAndRun runner, options, (err, result, details) ->
      # stop Runner before returning

      runner.stop (stopErr) ->
        console.log 'WARN: Error during stop()', stopErr if stopErr
        return callback err, result, details

parse = (args) ->
  program = require 'commander'

  addScript = (ignore, list) ->
    list.push ignore
    return list

  program
    .arguments '<job.js>'
    .action((url) ->
      program.codeurl = url
    )
    .option('--port <portnumber>', 'Port to use for Runner HTTP server', Number, 8099)
    .option('--timeout <seconds>', 'Number of seconds to limit job to', Number, 60)
    .option('--verbose [enable]', 'Verbose, logs console of job execution', Boolean, false)
    .option('--joboptions <json>', 'Options to provide the job, as second argument of jsJobRun()', String, '{}')
    .option('--script <code>', 'JavaScript code injected before jsjob.js. Used for polyfills or API adapters', addScript, [])
    .parse(process.argv)

  options = program
  options.options = undefined
  options._events = undefined
  options.args = undefined
  options.timeout = options.timeout * 1000 # seconds -> milliseconds
  options.joboptions = JSON.parse options.joboptions
  options.scripts = options.script

  return options

# TODO: if .js file is not an URL (or a file:// url), to start a HTTP server and serve it from there
exports.main = main = () ->
  options = parse process.argv

  runJob options, (err, results, details) ->
    if err
      console.error err
      process.exit 1
    
    console.log results

main() if not module.parent
