/**
 * Created by Administrator on 2017/4/6.
 */
var path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var localIdentName = process.env.NODE_ENV != 'production'?'[path][name]---[local]---[hash:base64:5]':'[hash:base64]';
module.exports = {
    common:[
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /.jsx/,
            use: [{
                loader: 'bundle-loader',
                options:{
                    lazy: true
                }
            }, {
                loader: 'babel-loader'
            }]
        }
    ],
    client: [{
        test: /\.less$/,
        use: ExtractTextPlugin.extract([
            {
                loader: 'css-loader',
                options:
                {
                    context: path.join(__dirname, '..', 'src'),
                    localIdentName: localIdentName,
                    modules: true
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: function () {
                        return [
                            require("autoprefixer")({
                                browsers: ['ie>=9','>1% in CN']
                            })
                        ];
                    }
                }
            },
            {
                loader: 'less-loader',
                options:
                {
                    strictMath: true
                }
            }
        ])
    }, {
        test: /\.css/,
        use: ExtractTextPlugin.extract([
            {
                loader: 'css-loader'
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: function () {
                        return [
                            require("autoprefixer")({
                                browsers: ['ie>=9','>1% in CN']
                            })
                        ];
                    }
                }
            }
        ])
    }],
    server: [{
        test: /\.less$/,
        use: [
            {
                loader: 'css-loader/locals',
                options:
                {
                    context: path.join(__dirname, '..', 'src'),
                    localIdentName: localIdentName,
                    modules: true
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    plugins: function () {
                        return [
                            require("autoprefixer")({
                                browsers: ['ie>=9','>1% in CN']
                            })
                        ];
                    }
                }
            },
            {
                loader: 'less-loader',
                options:
                {
                    strictMath: true
                }
            }
        ]
    }]
};