
http = require 'http'
url = require 'url'
child_process = require 'child_process'
path = require 'path'
uuid = require 'uuid'

debug = require('debug')('jsjob:runner')

try
  phantomjs = require 'phantomjs'
catch e
  debug 'Could not load PhantomJS 1', e

clone = (obj) ->
  return JSON.parse JSON.stringify obj

htmlEscape = (html) ->
  return String(html)
  .replace(/&(?!\w+;)/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

generateHtml = (filter, page, options) ->

  library = """
  window.jsJobEvent = function(id, payload) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.location.href+'/event', true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    var message = { id: id, payload: payload };
    xhr.send(JSON.stringify(message));
  };
  """

  script = """
  console.log('runner script load');
  var serializeError = function(err) {
    if (!err) { return null; }
    var obj = { 'message': err.message, 'stack': err.stack };
    // copy custom properties
    for (var key in err) {
        obj[key] = err[key];
    }
    return obj;
  };
  var sendResponse = function(err, solution, details) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.location.href, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    var payload = {error: serializeError(err), solution: solution, details: details};
    xhr.send(JSON.stringify(payload));
  };
  var cb = function(err, solution, details) {
    var solutionLength = (solution) ? solution.length : 0;
    var detailsLength = (details && typeof(details) === 'object') ? Object.keys(details).length : 0;
    console.log('solve done', typeof(solution), solutionLength, typeof(details), detailsLength);
    if (err) {
      console.log('solve error', err);
    }
    sendResponse(err, solution, details);
  };
  var main = function() {
    console.log('poly: main start');
    var dataElement = document.getElementById("poly-input-data");
    var data = JSON.parse(dataElement.innerHTML);
    console.log('poly: starting solving');
    window.jsJobRun(data.page, data.options, cb);
    console.log('poly: started');
  };
  window.onload = main;
//  main();
  """

  payload = { page: page, options: options }
  json = JSON.stringify payload, null, 4

  scriptTags = ("<script>#{s}</script>" for s in options.scripts).join("\n")
  body = """<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf=8">
      #{scriptTags}
      <script>#{library}</script>
      <script src="#{filter}"></script>
      <script id="poly-input-data" type="application/json">#{json}</script>
    </head>
    <body>
      <script>#{script}</script>
    </body>
  </html>
  """
  return body

deserializeError = (object) ->
  return null if not object

  if object.message
    err = new Error object.message if object.message
    err.stack = object.stack if object.stack
    # copy custom properties
    for k, v of object
      err[k] = v
    return err

  return new Error "ExternalSolver: Unknown error returned from phantomjs: #{JSON.stringify(object)}"

# XXX: may need to inject Function.bind polyfill

class Runner
  constructor: (@options={}) ->
    @server = null
    @jobs = {} # UUID string -> Job {}

    debug 'constructor', @options

    @options.port = 8088 if not @options.port
    timeout = process.env['JSJOB_TIMEOUT']
    @options.timeout = parseInt(timeout)*1000 if timeout and not @options.timeout
    @options.verbose = true if process.env['JSJOB_VERBOSE'] and not @options.verbose?
    @options.detailsLog = process.env['JSJOB_DETAILS_LOG'] == 'true' if process.env['JSJOB_DETAILS_LOG']? and not @options.detailsLog?
    @options.scripts = [] if not @options.scripts

  start: (callback) ->
    debug 'start', @options.port
    @server = http.createServer (req, res) =>
      @onRequest req, res
    @server.listen @options.port, (err) =>
      debug 'started', @options.port
      return callback err

  stop: (callback) ->
    debug 'stop', @options.port
    @server.close (err) =>
      debug 'stopped', @options.port
      return callback err if typeof callback == 'function'

  runJob: (codeUrl, inputData, jobOptions, callback) ->
    debug 'running job', codeUrl, typeof inputData, typeof jobOptions

    jobOptions.scripts = @options.scripts if not jobOptions.scripts
    processOptions = clone @options
    processOptions.allowedResources = jobOptions.allowedResources
    p = new PhantomProcess processOptions
    job =
      id: uuid.v4()
      process: p
      filter: codeUrl
      page: inputData
      options: jobOptions
      solution: null
      details: {}
      screenshots: {}
      events: []
    p.run job, (err) =>
      sol = job.solution
      details = job.details
      details = {} if not details
      if @options.detailsLog
        details.stdout = p.stdout
        details.stderr = p.stderr
      details.screenshots = job.screenshots
      delete @jobs[job.id]
      return callback err, sol, details if err
      return callback job.error, sol, details
    @jobs[job.id] = job

  # FIXME: implement communication to and from the JavaScript process using FBP-runtime protocol
  onRequest: (request, response) ->
    parsed = url.parse request.url
    paths = parsed.pathname.split '/'

    if paths.length == 3
      # GET /solve/$jobId
      # POST /solve/$jobId
      jobId = paths[2]
      return @handleSolveRequest jobId, request, response
    else if paths.length == 4
      # POST /solve/$jobid/event
      jobId = paths[2]
      if paths[3] == 'event'
        return @handleEventRequest jobId, request, response
      else
        return response.end()
    else
      return response.end()

  handleSolveRequest: (jobId, request, response) ->
    console.log "#{request.method} #{jobId}" if @options.verbose
    job = @jobs[jobId]
    if not job
      # multiple callbacks for same id, or wrong id
      debug 'could not find solve job', jobId
      return

    if request.method == 'GET'
      # FIXME: make only for GET
      response.writeHead 200, {"Content-Type": "text/html; charset=utf-8"}
      body = generateHtml job.filter, job.page, job.options
      response.end body
    else if request.method == 'POST'
      data = ""
      request.on 'data', (chunk) -> data += chunk
      request.on "end", =>
        console.log 'END', data.length if @options.verbose
        out = JSON.parse data
        job.solution = out.solution
        job.details = out.details
        err = null
        err = deserializeError out.error if out.error
        err = new Error 'Neither solution nor error was provided' if not (out.error or out.solution)
        job.error = err
        job.process.stop()
        response.writeHead 204, {}
        response.end()

  handleEventRequest: (jobId, request, response) ->
    debug 'event request', jobId
    job = @jobs[jobId]
    if not job
      # wrong id, or called after job completed
      debug 'could not find job for event', jobId
      return response.end()
    return response.end() if request.method != 'POST'

    data = ""
    request.on 'data', (chunk) ->
      data += chunk
    request.on "end", =>
      event = JSON.parse data
      @handleEvent job, event
      response.writeHead 204, {}
      response.end()

  handleEvent: (job, event) ->
    debug 'event', job.id, event.id
    if event.id == 'screenshot'
      name = event.payload.name
      # screenshot ignored, currently cannot be saved by apis in good way
    else
      job.events.push event

# Mapping of exit code to error. Needs to match behavior of ../bin/phantomjs-loadpage.js
phantomErrors =
  1: 'Wrong arguments'
  2: 'Failed to open solver page'
  3: 'Soft timeout'
  4: 'Uncaught JavaScript Error'

# TODO/PERF: use WebDriver mode and keep a long-running phantomjs instance
class PhantomProcess
  constructor: (@options={}) ->
    @child = null
    @stopping = false

    @options.port = 8088 if not @options.port
    @options.port = parseInt @options.port if typeof @options.port == 'string'
    browser = process.env.JSJOB_BROWSER
    browser = phantomjs?.path if not browser
    browser = 'phantomjs' if not browser
    @options.phantomjs = browser if not @options.phantomjs
    @options.timeout = 60*1000 if not @options.timeout
    @options.hardtimeout = @options.timeout+(5*1000) if not @options.hardtimeout

    @stdout = ""
    @stderr = ""

  run: (job, callback) ->
    baseUrl = "http://localhost:#{@options.port}/solve/"

    prog = @options.phantomjs
    script = path.join __dirname, '../bin/phantomjs-loadpage.js'
    args = [
      script
      baseUrl + job.id.toString()
    ]
    args.push @options.timeout.toString() if @options.timeout
    if @options.allowedResources
      allowed = [ job.filter, baseUrl ].concat @options.allowedResources
      args.push JSON.stringify(allowed)

    cmd = "#{prog}" + args.join ' '
    console.log "Running '#{cmd}'" if @options.verbose
    @child = child_process.spawn prog, args

    onHardTimeout = () =>
      return if not callback # already returned
      @stopping = true
      @child.kill 'SIGKILL'
      # should now fire exit handler
    setTimeout onHardTimeout, @options.hardtimeout

    @stdout = ""
    @child.stdout.on 'data', (data) =>
      console.log data.toString() if @options.verbose
      @stdout += data.toString()
    @stderr = ""
    @child.stderr.on 'data', (data) =>
      console.log data.toString() if @options.verbose
      @stderr += data.toString()

    @child.on 'error', (err) =>
      console.log 'child error', err if @options.verbose
      callback err if callback
      callback = null
    @child.on 'exit', (code, signal) =>
      console.log 'exit', code, signal if @options.verbose
      return if not callback

      details = "\n#{@stderr}\n#{@stdout}"
      if code and not signal
        reason = phantomErrors[code]
        err = new Error "PhantomJS exited with #{code} #{signal} '#{reason}':#{details}"
        err.stack = err.stack.replace(details, '...')
        callback err
      else if not code and signal == 'SIGKILL'
        err = new Error "Hit hard timeout limit of #{@options.hardtimeout/1000} seconds:#{details}"
        err.stack = err.stack.replace(details, '...')
        callback err
      else if not @stopping
        err = new Error "JsJob child process terminated unexpectedly #{code} #{signal}"
        callback err
      else
        callback null, job.id
      callback = null
      @stopping = null
      return

  stop: () ->
    @stopping = true
    @child.kill()

module.exports = Runner

