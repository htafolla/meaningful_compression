const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', 
      inject: 'body', // Inject the scripts at the end of the body
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'), 
    }),
    ...(process.env.NODE_ENV === 'production' ? [new BundleAnalyzerPlugin()] : []),
  ],
  entry: './src/index.js',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), 
    },
    headers: { 
      "Content-Type": "text/html", // Corrected Content-Type
    }
  },
  output: { 
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), 
  },
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'development', // Removed duplicate mode
};
