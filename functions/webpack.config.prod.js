const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const webpack = require('webpack');

module.exports = merge(baseConfig, {
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /environments\/environment\.ts/,
      'environment.prod.ts'
    ),
  ],
});
