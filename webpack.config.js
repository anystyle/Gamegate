const path = require('path');

module.exports = (env, argv) => {
  const isProduction = env.NODE_ENV === 'production';
  const isVercel = env.VERCEL === '1';

  // Common configuration
  const config = {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      'express': 'express'
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      node: '10.13.0' // Node.js 10+ should not need polyfills
                    },
                    modules: false,
                    useBuiltIns: 'entry'
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      minimize: isProduction
    },
    target: 'node',
    externals: {
      // Keep Node.js modules external for Vercel
      express: 'commonjs express',
      cors: 'commonjs cors',
      helmet: 'commonjs helmet',
      compression: 'commonjs compression',
      'express-rate-limit': 'commonjs express-rate-limit',
      'dotenv': 'commonjs dotenv',
      'node-cache': 'commonjs node-cache'
    },
    plugins: [
      new (require('webpack').DefinePlugin)({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.VERCEL': JSON.stringify(env.VERCEL || '0')
      })
    ],
    stats: {
      colors: true,
      warnings: false,
      errorDetails: false
    },
    devtool: isProduction ? false : 'source-map'
  };

  // Vercel-specific configuration
  if (isVercel) {
    config.target = 'node'; // Target Node.js environment for Vercel
    config.optimization = {
      ...config.optimization,
      minimize: true
    };
    config.externals = {
      ...config.externals,
      // Keep all Node.js modules external for serverless
      fs: 'commonjs fs',
      path: 'commonjs path',
      util: 'commonjs util',
      url: 'commonjs url',
      querystring: 'commonjs querystring',
      http: 'commonjs http',
      https: 'commonjs https',
      zlib: 'commonjs zlib'
    };
    config.output.libraryTarget = 'commonjs2';
    config.output.globalObject = false;
  }

  return config;
};