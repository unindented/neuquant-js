'use strict'

var configFactory = require('./webpack.config.factory')

module.exports = function (config) {
  var coverage = config.singleRun

  config.set({
    browserNoActivityTimeout: 60000,

    webpackPort: 9874,
    runnerPort: 9875,
    port: 9876,

    basePath: '',

    files: ['tests.js'],

    browsers: ['PhantomJS'],
    frameworks: ['mocha'],

    preprocessors: {
      'tests.js': ['webpack', 'sourcemap']
    },

    webpack: configFactory({test: true, coverage: coverage}),

    webpackMiddleware: {
      noInfo: true
    },

    reporters: (coverage ? ['dots', 'coverage'] : ['dots']),

    coverageReporter: {
      dir: 'coverage',

      reporters: [
        {type: 'html', subdir: 'report-html'},
        {type: 'lcov', subdir: 'report-lcov'},
        {type: 'text'}
      ]
    }
  })
}
