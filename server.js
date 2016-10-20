(function () {
    'use strict';
    var express = require('express');
   
    var app = express();
    
var server = require('http').createServer(app);
    var port = process.env.PORT|| 7200; 


require('./core/route.js')(app,server,express);

server.listen(port);


  
})();
