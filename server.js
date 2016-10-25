(function () {
    'use strict';

    
    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);
    var port = process.env.PORT || 7200;
    var host = process.env.HOST || '192.168.0.11';
    require('./core/route.js')(app, server, port, host, express);
    
    
    server.listen(port, host);
})();
