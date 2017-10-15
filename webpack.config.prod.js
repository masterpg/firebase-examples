const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const webpack = require('webpack');
const UglifyEsPlugin = require('uglify-es-webpack-plugin');

module.exports = merge(baseConfig, {
  output: {
    filename: '[name].bundle.[chunkhash].js'
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /environments\/environment\.ts/,
      'environment.prod.ts'
    ),
    new UglifyEsPlugin(),
  ],
});
