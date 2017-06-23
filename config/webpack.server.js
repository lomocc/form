var webpack = require("webpack");
var HTMLWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require("path");
var autoprefixer = require('autoprefixer');
var rules = require("./rules");
function resolve (dir) {
    return path.join(__dirname, '..', dir)
}
// args
// var program = require('commander');
// program
//     .version('0.0.1')
//     .allowUnknownOption()
//     .option('-o, --os [value]', '平台', "default")
//     .parse(process.argv);
// if (process.env.NODE_ENV == undefined)
//     process.env.NODE_ENV = 'development';
//
// console.log("NODE_ENV:%s", process.env.NODE_ENV);

// var clientConfig = require('./webpack.config');
var fs = require('fs');
function getExternals() {
    return fs.readdirSync(resolve('node_modules'))
        .filter(filename => !filename.includes('.bin'))
        .reduce((externals, filename) => {
            externals[filename] = `commonjs ${filename}`

            return externals
        }, {})
}
var externals = getExternals();
// console.log('externals', externals);
var config = {
    context: resolve(''),
    entry: './src/server',
    output: {
        path: resolve('dist/server'),
        filename: "[name].js",
        chunkFilename: "[name].[chunkhash:8].js"
    },
    target: 'node',
    node: {
        __filename: true,
        __dirname: false
    },
    module: {
        rules: [{
            test: /\.(css|eot|svg|ttf|woff|woff2|svg|json|xml|png|jpeg|jpg|gif)$/,
            use: "null-loader"
        }]
    },
    plugins: [],
    externals: externals,
    resolve: {
        modules: ['node_modules', 'src'],
        extensions: ['.js', '.jsx', '.json', '.less']
    }
};
config.module.rules = rules.common.concat(config.module.rules, rules.server);
if (process.env.NODE_ENV == "production") {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings: false
            }
        })
    );
}else{

}
module.exports = config;