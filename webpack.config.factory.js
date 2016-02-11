'use strict'

var webpack = require('webpack')

module.exports = function (options) {
  return {
    entry: options.test ? {} : {
      'NeuQuant': './src/'
    },

    output: {
      path: './dist/',
      pathinfo: options.test,

      filename: 'neuquant' + (options.environment === 'production' ? '.min' : '') + '.js',

      library: '[name]',
      libraryTarget: 'umd'
    },

    debug: options.test,
    devtool: (options.test ? 'eval' : null),

    resolve: {
      modulesDirectories: [
        'node_modules'
      ]
    },

    resolveLoader: {
      modulesDirectories: [
        'test/loaders',
        'node_modules'
      ]
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(lib|node_modules)[\\\/]/,
          loader: options.coverage ? 'isparta' : 'babel'
        },
        {
          test: /\.json$/,
          exclude: /(lib|node_modules)[\\\/]/,
          loader: 'json'
        }
      ]
    },

    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(options.environment)
        }
      })
    ].concat(options.environment === 'production' ? [
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          screw_ie8: true,
          warnings: false
        }
      })
    ] : [])
  }
}
