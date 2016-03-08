module.exports = ->
  pkg = @file.readJSON 'package.json'
  repo = pkg.repository.url.replace 'git://', 'https://'+process.env.GH_TOKEN+'@'

  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # BDD tests on Node.js
    mochaTest:
      nodejs:
        src: ['spec/*.coffee']
        options:
          reporter: 'spec'
          grep: process.env.TESTS

    # Coding standards
    coffeelint:
      components:
        files:
          src: [
            'components/*.coffee'
            'lib/*.coffee'
          ]
        options:
          max_line_length:
            value: 120
            level: 'warn'

    # Web server serving design systems used by ExternalSolver
    connect:
      server:
        options:
          port: 8001

    exec:
     sudoku: './node_modules/.bin/webpack examples/sudoku.js dist/examples/sudoku.js'

    'gh-pages':
      options:
        base: 'dist'
        clone: 'gh-pages'
        message: 'Deploying dist/ to gh-pages'
        repo: repo
        user:
          name: 'JsJob bot'
          email: 'bot@thegrid.io'
        silent: true
      src: '**/*'

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-exec'

  # Grunt plugins used for testing
  @loadNpmTasks 'grunt-mocha-test'
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-contrib-connect'

  # Grunt plugins used for deploying
  @loadNpmTasks 'grunt-gh-pages'

  # Our local tasks
  @registerTask 'test', 'Build and run automated tests', (target = 'all') =>
    @task.run 'coffeelint'
    @task.run 'connect'
    @task.run 'mochaTest'

  @registerTask 'default', ['test']
