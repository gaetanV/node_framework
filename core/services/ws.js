(function () {
    'use strict';
    module.exports = Ws;
    function Ws(inject,params) {
        var WebSocketServer = require('ws').Server;
        var port=params.port|8098;
        console.log(params);
        var wss = new WebSocketServer({port: port, host: inject.$host});
        var clients = [];
       
        
        
        function ROOM(name, roles) {
            this.name = name;
            this.roles = roles;
            var space = [];
            this.addSpace = function (id,data) {
                space[id] = new SPACE(this.name + ":" + id, this.roles,data);
            }
            this.getSpace = function (id) {
                if (!space.hasOwnProperty(id)) {
                    return false;
                }
                return space[id];
            }
        }
        
        function SPACE(name, roles,data) {
            this.name = name;
            try{
                this.data=JSON.stringify(data);
            }catch(e){
                this.data=data;
            }
            
            this.roles = roles;
            this.client = [];
            this.garbage = function () {
                for (var i in this.client) {
                    if (!clients.hasOwnProperty(i)) {
                        delete this.client[i];
                    }

                }

            }
            this.broadcast = function (data) {
                if(data){
                    try{
                        this.data=JSON.stringify(data);
                    }catch(e){
                        this.data=data;
                    }
                }
                //this.garbage();
                console.log("********************* ");
                console.log("broadcast " + this.name);
                console.log(this);

                for (var i in this.client) {
                    try {
                        var client = clients[i];
                        client.send(
                                JSON.stringify(
                                        {type: "WATCH", id: this.name, data:this.data}
                                )
                                );


                    } catch (e) {
                        delete this.client[i];
                    }
                }
                console.log("********************* ");
            }

        }

        var ROOMSPACE = {};

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
        }

        wss.on('connection', function (ws) {
            ws.id = guid();
            console.log("********** NEW   " + ws.id + "**********");
            clients[ws.id] = ws;
            

            ws.send(
                    JSON.stringify({type: "MESSAGE", data: "now you can register @stream"})
            );

            ws.on('close', function () {
                console.log("********** DELETE   " + ws.id + "**********");
                delete clients[ws.id];

            });

            ws.on('message', function (param) {
                var message = JSON.parse(param);
                if (message.hasOwnProperty("watch")) {
                    var space = (message.watch).split(":");
                    if (space.length === 2) {

                        var room = getRoom(space[0], space[1]);
                        if (room) {
                            room.client[ws.id] = "new client";
                            room.broadcast();
                            ws.send(JSON.stringify(
                                    {type: "MESSAGE", data:
                                                "you are register in room " + space[0]
                                    }
                            ))
                        }
                    }
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
            ROOMSPACE[namespace] = new ROOM(namespace, roles);
            return ROOMSPACE[namespace];
        };


        var room = setRoom("user", ["ROLE_ADMIN"]);
        room.addSpace(1,{name:"dynamic name",type:"sync"});
        var rootscoop = setRoom("public", "IS_AUTHENTICATED_ANONYMOUSLY");
        rootscoop.addSpace("flux");


        return {
            setRoom: setRoom,
            getRoom: getRoom,
        };

    }
})();