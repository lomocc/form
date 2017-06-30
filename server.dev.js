var express = require('express');
var path = require('path');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');
var findFreePort = require('find-free-port');
var app = express();

var compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    // publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

//app.use(/*require('compression')(), */express.static(path.join(__dirname, 'build')));
// app.get('/', function(req, res) {
//     res.sendFile(__dirname + 'build/index.html');
// });

findFreePort(4000, function(err, freePort){
    app.listen(freePort, function () {
        var host = this.address().address;
        var port = this.address().port;

        console.log('listening at http://%s:%s', host, port);
        console.log('process env NODE_ENV = %s', process.env.NODE_ENV);
    });
});