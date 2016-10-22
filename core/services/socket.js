(function () {
    'use strict';
    module.exports = Socket;
    function Socket(inject) {

        var io = require('socket.io')(inject.$server);
        var socket;
        var clients = [];



        function ROOM(name,roles) {
            this.name=name;
            this.roles = roles;
            var space = [];
            this.addSpace = function (id) {
                space[id] = new SPACE(this.name+":"+id,this.roles);
            }
            this.getSpace = function (id) {
                if (!space.hasOwnProperty(id)) {
                    return false;
                }
                return space[id];
            }

        }


        function SPACE(name,roles,id) {
            this.name=name;
            this.id=id;
            this.roles = roles;
            this.client = [];
            this.garbage = function () {
                for (var i in this.client) {
                    if (!clients.hasOwnProperty(i)) {
                        delete this.client[i];
                    }

                }

            }
            this.broadcast = function(data){
                console.log("********************* ");
                console.log("broadcast "+this.name);
                console.log(this);
                 for (var i in this.client) { 
                    if (!clients.hasOwnProperty(i)) {
                        delete this.client[i];
                    }
                    
                 
                    clients[i].emit(this.name,data);
                   
                 }
                 console.log("********************* ");
            }

        }
       
        
        
        var NAMESPACE = {};
        var ROOMSPACE = {};
       



        io.on('connection', function (socket) {

            console.log("********** NEW   " + socket.id + "**********");
            clients[socket.id] = socket;


            socket.emit('isConnect', "now register @ stream");

            socket.on('disconnect', function () {
                console.log("********** DELETE   " + socket.id + "**********");
                delete clients[socket.id];


            });

            socket.on('watch', function (param) {
                console.log("--------------");
                console.log(socket.id);
                console.log(param);
                console.log("--------------");
                if (param.hasOwnProperty("room") && param.hasOwnProperty("id")) {
                    var room = getRoom(param.room, param.id);
                    if (room) {
                        //// SECURITY TO DO
                        room.garbage();
                        room.client[socket.id] = "new client";
                        socket.emit('info', "you are register in room " + param.room);
                    } else {
                        socket.emit('info', "you can't register in room");
                    }


                    console.log(room);
                    console.log("you can get the room");
                }
                if (param.hasOwnProperty("space")){
                     var space = getSpace(param.space);
                     if (space) {
                          //// SECURITY TO DO
                        space.garbage();
                        space.client[socket.id] = "new client";
                        socket.emit('info', "you are register in space " + param.space);
                    } else {
                        socket.emit('info', "you can't register in space");
                    }
                    
                     console.log(space);
                     console.log("you can get the space");
                }

            });


        });

        var getRoom = function (namespace, id) {
            if (!ROOMSPACE.hasOwnProperty(namespace)) {
                return false;
            }
            var room = ROOMSPACE[namespace];
            var space = room.getSpace(id);
            return space;
        };

        var setRoom = function (namespace, roles) {
            ROOMSPACE[namespace] = new ROOM("ROOM:"+namespace,roles);
            return ROOMSPACE[namespace];
        };

        var setSpace = function (namespace, roles) {
            NAMESPACE[namespace] = new SPACE("SPACE:"+namespace,roles);
            return NAMESPACE[namespace];
        }
        
        var getSpace =function (namespace) {
                if (!NAMESPACE.hasOwnProperty(namespace)) {
                    return false;
                }
                return NAMESPACE[namespace];
        };


        var room = setRoom("user", ["ROLE_ADMIN"]);
        room.addSpace(1);
        setSpace("flux", "IS_AUTHENTICATED_ANONYMOUSLY");

        return {
            getSpace: getSpace,
            setSpace: setSpace,
            setRoom: setRoom,
            getRoom: getRoom,
        };

    }
    ;

})();