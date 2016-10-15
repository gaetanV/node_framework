(function () {
    'use strict';
 
    var express = require('express');
    var app = express();
    require('http').Server(app);
    var port = process.env.PORT|| 7200; 
   app.listen(port);
    var route=require('./app/route.js')(app,express);
    route.public("/","./web/");
    route.add("./src/UserBundle/routing.yml","/user");


})();
