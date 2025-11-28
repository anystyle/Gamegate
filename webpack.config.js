const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  target: 'node18',
  entry: './api/index.js',
  output: {
    path: path.resolve(__dirname, '.vercel/output'),
    filename: 'api/index.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    // Node.js built-in modules that should remain external
    'fs': 'commonjs fs',
    'path': 'commonjs path',
    'url': 'commonjs url',
    'querystring': 'commonjs querystring',
    'util': 'commonjs util',
    'stream': 'commonjs stream',
    'buffer': 'commonjs buffer',
    'events': 'commonjs events',
    'crypto': 'commonjs crypto',
    'http': 'commonjs http',
    'https': 'commonjs https',
    'os': 'commonjs os'
  },
  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      // Don't try to polyfill Node.js modules for serverless
      'fs': false,
      'path': false,
      'url': false,
      'querystring': false,
      'util': false,
      'stream': false,
      'buffer': false,
      'events': false,
      'crypto': false,
      'http': false,
      'https': false,
      'os': false
    }
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            targets: {
              node: '18'
            }
          }
        }
      }
    ]
  }
};