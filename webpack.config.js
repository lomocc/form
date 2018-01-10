var webpack = require('webpack');
var assign = require('object-assign');
var path = require('path');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var filename = 'formlite';
function getConf(filename, conf) {
  var baseConf = {
    entry: './src/index.js',
    output: {
      path: path.resolve('dist/'),
      filename: filename,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }]
    },
    externals: ['react', 'react-dom']
  };
  return assign(baseConf, conf);
}
var es5Conf = getConf(filename + '.js', {
});
var es5MinConf = getConf(filename + '.min.js', {
  plugins:[new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  })],
});
// var npmConf = getConf(filename + '.es6.js', {
//   //plugins: [new BundleAnalyzerPlugin()]
// });
module.exports = [es5Conf, es5MinConf];
