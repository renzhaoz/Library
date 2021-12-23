/**
 * @description - webpack config for production environment.
 */

var path = require('path');

// Compress js files
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// Extract css from js
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Optimize & Minimize css & delete
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  performance: {
    hints: 'warning'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      "components": path.resolve("src/components"),
      "utils": path.resolve("src/utils"),
      "views": path.resolve("src/views"),
      "router": path.resolve("src/router")
    }
  },
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
    publicPath: 'dist/'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      // Mr all css
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css|scss$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash:6].[ext]'
            }
          }
        ]
      },
      {
        test: /\.properties$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(svg|png|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024 * 24
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Compress js file config
    new UglifyJsPlugin({
      cache: true, // cache
      parallel: 4, // Multi-core
      sourceMap: false, // Source file mapping
      uglifyOptions: {
        compress: {
          dead_code: true, // Remove useless code
          drop_console: false, // clean console.log
          drop_debugger: true, // clean debug
          warnings: true, // clean warning
          passes: 1 // compress times
        },
        output: {
          comments: true // clean comment
        },
        mangle: {
          reserved: ['$super', '$', 'exports', 'require']
        },
        warnings: false // no build warning
      }
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    new OptimizeCSSAssetsPlugin(),

    new HtmlWebpackPlugin({
      filename: '../index.html',
      inject: false,
      template: path.resolve(__dirname, './template.html')
    })
  ]
};
