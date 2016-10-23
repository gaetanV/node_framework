(function () {
    'use strict';
    module.exports = Ws;
    function Ws(inject) {
        var WebSocketServer = require('ws').Server;

        var wss = new WebSocketServer({port: 8098, host: "127.0.0.1"});
        var clients = [];



        function ROOM(name, roles) {
            this.name = name;
            this.roles = roles;
            var space = [];
            this.addSpace = function (id) {
                space[id] = new SPACE(this.name + ":" + id, this.roles);
            }
            this.getSpace = function (id) {
                if (!space.hasOwnProperty(id)) {
                    return false;
                }
                return space[id];
            }

        }


        function SPACE(name, roles, id) {
            this.name = name;
            this.id = id;
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
                this.garbage();
                console.log("********************* ");
                console.log("broadcast " + this.name);
                console.log(this);
                for (var i in this.client) {         
                    clients[i].send(
                            JSON.stringify(
                                {type:"WATCH",id:this.name,data: data}
                            )
                    );

                }
                console.log("********************* ");
            }

        }


        var NAMESPACE = {};
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
            ws.id=guid();
        
            console.log("********** NEW   " + ws.id + "**********");
            clients[ws.id] = ws;


            ws.send(
                         JSON.stringify(
                                {type:"MESSAGE",data:"now you can register @stream"}
                            ));

            ws.on('close', function () {
                console.log("********** DELETE   " + ws.id + "**********");
                delete clients[ws.id];

            });
            
            ws.on('message', function (param) {  
              
               var message= JSON.parse(param);
         
                     
                   if(message.hasOwnProperty("watch")){
                       var space=(message.watch).split(":");
                       if(space.length===2){
                             
                             var room = getRoom(space[0], space[1]);
                             if(room){
                                 room.client[ws.id] = "new client";
                                 ws.send( JSON.stringify(
                                {type:"MESSAGE",data:
                                    "you are register in room " + space[0]
                                     }
                            ))
                                 
                              
                             }
                             console.log(room);
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
            ROOMSPACE[namespace] = new ROOM(namespace,roles);
            return ROOMSPACE[namespace];
        };

        var setSpace = function (namespace, roles) {
            NAMESPACE[namespace] = new SPACE(namespace,roles);
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
})();