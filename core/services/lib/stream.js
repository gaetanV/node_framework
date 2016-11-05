 (function () {
 
    'use strict';

    function stream(clients,guid,$fs,$path) {
        var STREAM = [];
        var PERISISTENCE = [];
        ///IF CACHE IS MEMORY
     
        var CACHE=require('../../cache.js')("mongo");
        
        
        function ENTITY() {
            this.rooms = [];
        }
        class SPACE {
            constructor(index, path, fn, options, persistence) {
                this.fn = fn;
                this.options=options;
                var vm = this;
                this.client = [];
                this.persistence = [];
                this.path = path;
                this.index = index; 
                this.cache=new CACHE();
                for (var i in persistence) {
                    if (!this.persistence[persistence[i].targetEntity]) {
                        this.persistence[persistence[i].targetEntity] = []
                    }
                    ;
                    persistence[i].type = i;
                    this.persistence[persistence[i].targetEntity].push(persistence[i]);
                }

                var user = 1; // FROM SESSION TO DO 
                this.date = {
                    create: {date: Date.now(), user: user},
                    update: {date: Date.now(), user: user},
                }
                this.reload();
            }
            uploadEntity  (entity, data,callback) {
              
                    var buffer = [];
                    var vm = this;
                    var processed=0;
                    var nbTask=this.persistence[entity].length;
                    
                    for (var i in this.persistence[entity]) {
                        var replace = this.persistence[entity][i];
                        var index = data[replace.join];
                      
                        function load(before){
                            var cible = before;
                            if (replace.referenced) {
                                var path = replace.referenced.split(".");
                                for (var i in path) {
                                    if (cible[path[i]]) {
                                        cible = cible[path[i]];
                                    }
                                }
                            }
                            switch (replace.type) {
                                case "OneToOne":
                                    if (cible.id === index) {
                                        for (var j in cible) {
                                            cible[j] = data[j];
                                        }
                                        vm.cache.data = before;
                                        var b = vm.buffer(
                                         function(b){
                                          
                                            for (var userid in b) {
                                                if (!buffer[userid]) {
                                                    buffer[userid] = b[userid];
                                                } else {
                                                    for (var k in b[userid].data) {
                                                        buffer[userid].data.push(b[userid].data[k]);
                                                    }
                                                }
                                            }
                                            nbTask++;
                                            if(nbTask>=processed){
                                              
                                                callback(buffer);
                                            }
                                         
                                         });
                                        
                                    }
                                    break;
                               case "OneToMany":
                                   console.log("OneToMany");
                                    var indexArray = cible.map(function (d) {
                                        return d.id;
                                    }).indexOf(parseInt(index));
                                    
                                    if (indexArray !== -1) {
                                        for (var j in cible[indexArray]) {
                                            cible[indexArray][j] = data[j];
                                        }
                                    }
                                  
                                    vm.cache.data = before;
                                 
                                     var b = vm.buffer(
                                         function(b){
                                 
                                             for (var userid in b) {
                                           if (!buffer[userid]) {
                                               buffer[userid] = b[userid];
                                           } else {
                                               for (var k in b[userid].data) {
                                                   buffer[userid].data.push(b[userid].data[k]);
                                               }
                                           }
                                           nbTask++;
                                            if(nbTask>=processed){
                        
                                                callback(buffer);
                                            }
                                         }
                                        }
                            
                                    );
                                    break;
                            }
                        }
                        vm.cache.getData(load);
                    }
                return buffer;
            }
            register (socket) {
                    this.client[socket.id] = socket;
            };


            buffer (callback) {
              
                    var buffer = [];
                    var vm=this;
                    var processed=0;
                    var nbTask=this.client.length;
                    
                    function parseClient(i){
                       
                           vm.cache.getData(function(data){
                               var client = clients[i];
                                buffer[i] = ({
                                    client: client,
                                    data: [JSON.stringify({type: "data", watch: vm.path, data: JSON.stringify( data)})]
                                });
                         
                                processed++;
                                if(processed>=nbTask){
                                    callback(buffer);
                                }
                            });
                                
                    }
                    for (var i in this.client) {
                        try {
                            var client = clients[i];
                            if (!client)
                                    throw "client destroy";
                              parseClient(i);  
                        } catch (e) {
                            delete this.client[i];
                        }
                    }
          
            }
            reload (callback) {
                    var buffer = [];
                    var user = 1; // FROM SESSION
                    this.date.update = {date: Date.now(), user: user};
                    
                  this.cache.data = this.fn(this.options);
                    
                    this.buffer(function(b){
                        
                         for (var userid in b) {
                            if (!buffer[userid]) {
                                buffer[userid] = b[userid];
                            } else {
                                for (var k in b[userid].data) {
                                    buffer[userid].data.push(b[userid].data[k]);
                                }
                            }
                        }
                        callback(buffer);
                    });
                   
                   
                   
            }
        }


        class ROOM {
             constructor(path, fn, requirements, persistence) {
                this.persistence = persistence;
                for (var i in persistence) {
                    if (persistence[i].hasOwnProperty("targetEntity")) {
                        var entity = persistence[i].targetEntity;
                        if (!PERISISTENCE[entity]) {
                            PERISISTENCE[entity] = new ENTITY();
                        }
                        PERISISTENCE[entity].rooms.push(this);
                    }
                }
                this.fn = fn;
                this.path = path;
                this.requirements = requirements;
                var cache = [];
                this.getCache = function () {
                    return cache;
                }
            }
            getSpace (param, option, path) {
                var cache=this.getCache();
                var o = JSON.stringify(option);
                var p = JSON.stringify(param);
                var index = (p != undefined ? p : "{}") + "-" + (o != undefined ? o : "{}");
                if (!cache.hasOwnProperty(index)) {
                    var options = Object.keys(param).map(
                            function (k) {
                                return param[k];
                            }
                    );

                    cache [index] = new SPACE(index, path, this.fn, options, this.persistence);
                }
                return cache [index];
            }
        }
        var setStream = function (route) {
            route.param = [];
            if (route.path.match(/{([^{}]*)}/g)) {
                var t = route.path.replace(/{([^{}]*)}/g,
                        function (match) {

                            var c = match.slice(1, -1);
                            route.param.push(c);
                            if (route.requirements.hasOwnProperty(c)) {
                                var r = route.requirements.id;
                                return "([" + r + "^/])";
                            }
                            return "([.^/]{1,})"
                        }
                );
            } else {
                var t = route.path;
            }
            route.regex = new RegExp('^' + t + '$', 'gi');
            STREAM.push(route);
        }
        function updateEntity(entityname,id,object){
            var vm=this;
            if (PERISISTENCE.hasOwnProperty(entityname)) {
                var buffer=[];
                var rooms = PERISISTENCE[entityname].rooms;
                var processed=0;
                var nbTask=rooms.length;
                for (var i in rooms) {
                 
                    var room = rooms[i];
                    var cache = room.getCache();
                    for (var j in cache) {
                        //var b=cache [j].reload(load);                             /// RELOAD REQUEST
                        cache [j].uploadEntity(entityname, object,load);     /// PERISTENCE REQUEST 
                      
                        function load(b){
                          
                            function bufferUser(userid){
                             
                                 if(!buffer[userid]){
                                       buffer[userid]=b[userid];
                                  
                                   }else{
                                       for (var k in b[userid].data){
                                           buffer[userid].data.push(b[userid].data[k]);
                                       }
                                   }
                                        
                            }
                             for(var userid in b){bufferUser(userid)}   
                            processed++;
                               if(processed>=nbTask){
                                   update();
                               }
                            
                        }            
                    }
                }
                   
                function update(){
                
                    for (var userid in buffer) {
                        try {
                            var client = clients[userid];
                            var data=buffer[userid].data;
                            client.send(JSON.stringify({type: "buffer", data: JSON.stringify(data)}));
                        } catch (err) {
                            console.log(err);
                            console.log("---------CLIENT DESTROY--------------");
                            delete vm.client[i];
                        }
                    }
                    
                }
            
            } 
            return false;
        }
        return {
            updateEntity: updateEntity,
            setStream: setStream,
            getStream:  function (path, option) {

                for (var i in  STREAM) {
                    if (path.match(STREAM[i].regex)) {
                        var r = {};
                        var t = STREAM[i].regex.exec(path);

                        for (var j = 0; j < STREAM[i].param.length; j++) {
                            r[STREAM[i].param[j]] = t[j + 1];
                        }
                        ;
                        
                        return STREAM[i].getSpace(r, {}, path);
                    }
                }
                return false;
            },
            addRoute: function (config, BUNDLES) {
                
                function parseconfig(c){
                    
                    var controller = c.split(":");
                    var bundleName = controller[0];
                    var controllerName = controller[1];
                    var fn = controller[2];
                    
                    function parse(options){
                       var data=BUNDLES[bundleName].controllers[controllerName].execStream(fn,options);
                   
                       return data;
                    }
                    var option = {
                        path: config[i].path,
                        fn: parse,
                        requirements: config[i].requirements ? config[i].requirements : {},
                        persistence: config[i].persistence ? config[i].persistence : {}
                    }
                    setStream(new ROOM(option.path, option.fn, option.requirements, option.persistence));
                }
                for (var i in config) {
                    var c = config[i].defaults["_controller"];
                    parseconfig(c);
                }
            },
            PERISISTENCE: PERISISTENCE,
        }
    };
    module.exports = stream;


})();