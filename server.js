(function () {
    'use strict';
    var express = require('express');
    var app = express();
    require('http').Server(app);
    var port = process.env.PORT|| 7200; 
    app.listen(port);
    require('./core/route.js')(app,express);

 

  
})();
