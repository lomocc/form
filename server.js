var express = require('express');
var path = require('path');
var app = express();
app.use(require('compression')(), express.static(path.join(__dirname, 'dist/www')));
// app.get('/', function (req, res) {
//     res.send('Hello World!');
// });
var port = 3000;
findPort(port);

function findPort(port) {
    if(port > 65535){
        console.error("没有找到可用的端口");
        return;
    }
    app.listen(port, function () {
        var host = this.address().address;
        var port = this.address().port;

        console.log('listening at http://%s:%s', host, port);
        console.log('process env NODE_ENV = %s', process.env.NODE_ENV);
    }).on('error', function() {
        findPort(port + 1);
    });

}