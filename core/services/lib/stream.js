'use strict';

function stream($db,clients) {
    var STREAM = [];
    var PERISISTENCE = [];
    function ENTITY() {
        this.rooms = [];
    }
    
    function SPACE(index, path, fn, options, persistence) {
        this.fn = fn;
        var vm = this;
        var user = 1; // FROM SESSION
        this.client = [];
        this.persistence = [];
        for (var i in persistence) {
            if (!this.persistence[persistence[i].targetEntity]) {
                this.persistence[persistence[i].targetEntity] = []
            }
            ;
            persistence[i].type = i;
            this.persistence[persistence[i].targetEntity].push(persistence[i]);
        }
        this.path = path;
        this.index = index;
        this.register = function (socket) {
            this.client[socket.id] = socket;
        };
        this.date = {
            create: {date: Date.now(), user: user},
            update: {date: Date.now(), user: user},
        }
        this.uploadEntity = function (entity, data) {
            var buffer = [];
            var vm = this;
            for (var i in this.persistence[entity]) {
                var replace = this.persistence[entity][i];
                var index = data[replace.join];
                var before = vm.data;
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
                            vm.data = before;
                            var b = vm.buffer();
                            for (var userid in b) {
                                if (!buffer[userid]) {
                                    buffer[userid] = b[userid];
                                } else {
                                    for (var k in b[userid].data) {
                                        buffer[userid].data.push(b[userid].data[k]);
                                    }
                                }
                            }
                            //  vm.broadcast();
                        }
                        break;
                    case "OneToMany":
                        var indexArray = cible.map(function (d) {
                            return d.id;
                        }).indexOf(parseInt(index));
                        if (indexArray !== -1) {
                            for (var j in cible) {
                                cible[indexArray][j] = data[j];
                            }
                        }
                        vm.data = before;
                        //vm.broadcast();
                        var b = vm.buffer();
                        for (var userid in b) {
                            if (!buffer[userid]) {
                                buffer[userid] = b[userid];
                            } else {
                                for (var k in b[userid].data) {
                                    buffer[userid].data.push(b[userid].data[k]);
                                }
                            }

                        }
                        break;
                }
            }
            return buffer;
        }
        this.reload = function () {
            var buffer = [];
            var user = 1; // FROM SESSION
            vm.date.update = {date: Date.now(), user: user};
            vm.data = (vm.fn.apply(
                    {
                        db: $db
                    }, options
                    ));
            var b = vm.buffer();
            for (var userid in b) {
                if (!buffer[userid]) {
                    buffer[userid] = b[userid];
                } else {
                    for (var k in b[userid].data) {
                        buffer[userid].data.push(b[userid].data[k]);
                    }
                }
            }
            return buffer;
        }
        this.buffer = function () {
            var buffer = [];
            for (var i in this.client) {
                try {
                    var client = clients[i];
                    if (!client)
                        throw "client destroy";
                    buffer[i] = ({
                        client: client,
                        data: [JSON.stringify({type: "data", watch: this.path, data: JSON.stringify(this.data)})]
                    });

                } catch (e) {
                    delete this.client[i];
                }
            }
            return buffer;
        }
       /*  this.broadcast = function () {
            for (var i in this.client) {
                try {
                    var client = clients[i];
                    client.send(JSON.stringify(
                            {type: "data", watch: this.path, data: JSON.stringify(this.data)}
                    ));
                } catch (e) {
                    delete this.client[i];
                }
            }
        }*/
        this.reload();
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
         if (PERISISTENCE.hasOwnProperty(entityname)) {
                            var buffer=[];
                            var rooms = PERISISTENCE[entityname].rooms;
                            for (var i in rooms) {
                                var room = rooms[i];
                                var cache = room.getCache();
                                for (var j in cache) {
                                    //*************
                                    //TRY
                                    //***********************
                                    //var b=cache [j].reload();                             /// RELOAD REQUEST
                                    var b = cache [j].uploadEntity(entityname, object);     /// PERISTENCE REQUEST 
                                    for(var userid in b){
                                        if(!buffer[userid]){
                                            buffer[userid]=b[userid];
                                        }else{
                                            for (var k in b[userid].data){
                                                buffer[userid].data.push(b[userid].data[k]);
                                            }
                                        }
                                    }
                                   
                                }


                            }
                            
              
              
           
                for (var userid in buffer) {
                    
                    try {
                        
                        var client = clients[userid];
                        var data=buffer[userid].data;
       
                        client.send(JSON.stringify(
                                {type: "buffer", data: JSON.stringify(data)}
                        ));
                    } catch (err) {
                        console.log(err);
                        console.log("---------CLIENT DESTROY--------------");
                        //delete this.client[i];
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
            for (var i in config) {
                var c = config[i].defaults["_controller"];
                var controller = c.split(":");
                var bundleName = controller[0];
                var controllerName = controller[1];
                var fn = controller[2];
                var option = {
                    path: config[i].path,
                    fn: BUNDLES[bundleName].controllers[controllerName].controller[fn],
                    requirements: config[i].requirements ? config[i].requirements : {},
                    persistence: config[i].persistence ? config[i].persistence : {}
                }
                setStream(new ROOM(option.path, option.fn, option.requirements, option.persistence));
            }
        },
        PERISISTENCE: PERISISTENCE,
    }
}
;


module.exports = stream;