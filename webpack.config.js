const path = require('path');

module.exports = {
  // ビルドの起点となるファイルパスを設定。
  // このファイルからrequireされているファイルが芋づる式に取得されることになる。
  entry: {
    'app': './src/my-app.js',
  },
  output: {
    // ビルド結果のファイルパスを設定
    path: path.join(__dirname, 'public'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['*', '.webpack.js', '.web.js', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['flow']
          // presets: ['es2015', 'flow']
        }
      },
    ]
  },
  devtool: '#inline-source-map',
  // watch: true,
};
