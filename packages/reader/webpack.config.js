const path = require('path');

module.exports = {
  entry: './src/reader.js',
  output: {
    filename: 'reader.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SecureReader',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
}; 