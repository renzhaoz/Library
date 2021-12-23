/**
 * @description - webpack config for development environment.
 * @example - make watch
*/

var path = require('path');

// split css
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Cache babel result
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

// Create html template
var HtmlWebpackPlugin = require('html-webpack-plugin');

// Show package size on webpage
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'development',
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
        // exclude: /node_modules/, // Wait uptate shared code
        loader: 'babel-loader'
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(ttf|eot|png|svg|woff(2)?)(\?[a-z0-9]+)?$/,
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
      }
    ]
  },
  plugins: [
    // like DLL
    new HardSourceWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    new HtmlWebpackPlugin({
      filename: '../index.html',
      inject: false,
      template: path.resolve(__dirname, './template.html')
    }),

    new BundleAnalyzerPlugin(),
  ],
  devtool: 'inline-source-map'
};
