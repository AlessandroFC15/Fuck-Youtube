const path = require('path');

module.exports = {
  entry: {
    babel_polyfill: 'babel-polyfill',
    YoutubeVideoUnblocker: './src/js/YoutubeVideoUnblocker',
    background: './src/js/background',
  },
  output: {
    filename: './js/[name].js'
  },
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.resolve(__dirname, '../src/js')
    }]
  }
};
