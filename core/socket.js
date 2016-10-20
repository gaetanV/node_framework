(function () {
    'use strict';
    module.exports = Socket;
    function Socket(server) {
           
        var io = require('socket.io')(server);
        io.on('connection', function(){
           io.emit('isConnect', "users");

        });
        
        
    };

})();