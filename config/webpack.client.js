var webpack = require("webpack");
var HTMLWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var path = require("path");
var autoprefixer = require('autoprefixer');
var rules = require("./rules");

const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const webpack_isomorphic_tools_plugin =
    new Webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools-configuration'))
        .development()

// var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
//
// var webpackIsomorphicToolsPlugin =
//     // webpack-isomorphic-tools settings reside in a separate .js file
//     // (because they will be used in the web server code too).
//     new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools-configuration'))
//     // also enter development mMode since it's a development webpack configuration
//     // (see below for explanation)
//         .development();

// args
// var program = require('commander');
// program
//     .version('0.0.1')
//     .allowUnknownOption()
//     .option('-o, --os [value]', '平台', "default")
//     .parse(process.argv);
if (process.env.NODE_ENV == undefined)
    process.env.NODE_ENV = 'development';

console.log("NODE_ENV:%s", process.env.NODE_ENV);

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

var config = {
    context: resolve(''),
    // entry: "./src/__tests__/index.js",
    entry: {
        main: "./src/__tests__/index.js",
        vendor: ["react", "react-dom", "babel-polyfill"]
    },
    output: {
        path: resolve("dist/www/"),
        filename: "[name].[hash:8].js",
        chunkFilename: "[name].[chunkhash:8].js"
    },
    resolve: {
        modules: ['node_modules', 'src'],
        extensions: ['.js', '.jsx', '.json', '.less']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: "'" + process.env.NODE_ENV + "'",
                VERSION: "'" + new Date().toLocaleString() + "'" // 加入时间戳作为版本识别
            }
        }),
        // new HTMLWebpackPlugin({
        //     filename: '../../views/prod/index.html',
        //     template: './views/tpl/index.tpl.html',
        //     chunksSortMode: 'none'
        // }),
        new HTMLWebpackPlugin({
            template: resolve("template/index.html"),
            // minify: {
            //     collapseWhitespace: false
            // },
            chunksSortMode: 'none'
        }),
        new CopyWebpackPlugin([
            { context:"template", from: '**/*', copyUnmodified:true, ignore: 'index.html'},
        ]),
        new ExtractTextPlugin({filename: 'style.[contenthash:8].css', allChunks: true}),
        // new webpack.LoaderOptionsPlugin({
        //     mOptions: {
        //         postcss: function(){
        //             return [
        //                 require("autoprefixer")({
        //                     browsers: ['ie>=9','>1% in CN']
        //                 })
        //             ]
        //         }
        //     }
        // }),
        webpack_isomorphic_tools_plugin,
        new BundleAnalyzerPlugin()
    ],
    module: {
        rules: [
            {
                test    : webpack_isomorphic_tools_plugin.regular_expression('images'),
                include : resolve('src'),
                use     :
                    [{
                        loader : 'url-loader',
                        options:
                        {
                            limit: 10240 // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
                        }
                    }]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use : {
                    loader: 'file-loader',
                    options:
                    {
                        name: "assets/[name].[hash:8].[ext]"
                    }
                }

            }, {
                test: /\.(json|xml)$/,
                use : {
                    loader: 'file-loader',
                    options:
                    {
                        name: "assets/[name].[hash:8].[ext]"
                    }
                }
            }, {
                test: /\.html$/,
                use : {
                    loader: 'html-loader',
                    options:
                    {
                        minimize: false
                    }
                }
            }]
    }
};
config.module.rules = rules.common.concat(config.module.rules, rules.client);
if (process.env.NODE_ENV == "production") {
    // config.module.rules.push({
    //     test    : /\.js$/,
    //     exclude: /node_modules/,
    //     use: [{
    //         loader: 'babel-loader'
    //     }]
    // });
    // config.plugins.push(
    //     new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.js")
    // );
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings: false
            }
        })
    );
}else{
    // config.devtool = "#source-map";
    // config.entry.push('webpack-hot-middleware/client');
    // config.module.rules.push({
    //     test    : /\.js$/,
    //     exclude: /node_modules/,
    //     use: [{
    //         loader: 'babel-loader'
    //     }]
    // });
    // config.plugins.push(
    //     new webpack.HotModuleReplacementPlugin()
    // );
}
module.exports = config;