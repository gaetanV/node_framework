(function () {
    'use strict';

    
    var express = require('express');
    var app = express();
    var http=require('http');
    var server = http.createServer(app);
    var port = process.env.PORT || 7200;
    var host = process.env.HOST || '192.168.0.11';
    require('./core/route.js')(app, server, port, host, express,http);
    
    console.log( process.memoryUsage());
    server.listen(port, host);
})();
