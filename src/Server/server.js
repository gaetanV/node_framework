(function () {
    'use strict';
    var express = require('express');
    require('http').Server(app);
    var port = process.env.PORT|| 7200; 
    var app = express();
    app.use('/', express.static('../client/'));
    var route=require('./route.js')(app);
    route.add("./UserBundle/routing.yml","/user");
    app.listen(port);
})();
