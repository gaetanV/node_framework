(function () {
    'use strict';
    module.exports = Ws;
    function Ws($fs, $yaml, $path, $db, $bundles, $host, port, router, access_control) {

        var WebSocketServer = require('ws').Server;
        var port = port | 8098;

        var PERISISTENCE = [];

        var STREAM = [];
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


        var getStream = function (path, option) {
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
        }

        function SPACE(index, path, fn, options) {
            this.fn = fn;
            var vm = this;
            var user = 1; // FROM SESSION
            this.client = [];
            this.path = path;
            this.index = index;
            this.register = function (socket) {
                this.client[socket.id] = socket;
            };
            this.date = {
                create: {date: Date.now(), user: user},
                update: {date: Date.now(), user: user},
            }
            this.reload = function () {
                var user = 1; // FROM SESSION
                vm.date.update = {date: Date.now(), user: user};
                vm.data = (vm.fn.apply(
                        {
                            db: $db
                        }, options
                        ));
            }
            this.broadcast = function () {
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
            }
            this.reload();


        }
        function ENTITY(){
            this.rooms=[];
        }
        
        function ROOM(path, fn, requirements,persistence) {
            this.persistence=persistence;
  
            for(var i in persistence){
                if(persistence[i].hasOwnProperty("targetEntity")){
                     var entity= persistence[i].targetEntity;
                     if(!PERISISTENCE[entity]){
                         PERISISTENCE[entity]=new ENTITY();
                     }
                     PERISISTENCE[entity].rooms.push(this);
                }
        
            }
            this.fn = fn;
            this.path = path;
            this.requirements = requirements;
            
            var cash = [];
            this.getCash = function () {
                return cash;
            }
            this.getSpace = function (param, option, path) {
                var o = JSON.stringify(option);
                var p = JSON.stringify(param);
                var index = (p != undefined ? p : "{}") + "-" + (o != undefined ? o : "{}");
                if (!cash.hasOwnProperty(index)) {
                    var options = Object.keys(param).map(
                            function (k) {
                                return param[k];
                            }
                    );
                    cash[index] = new SPACE(index, path, fn, options);
                }
                return cash[index];
            }
        }
        console.log($bundles);
        if ($bundles) {
            var BUNDLES = $bundles;



            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
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
        }

        var wss = new WebSocketServer({port: port, host: $host});

        var clients = [];


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
                try {
                    var message = JSON.parse(param);
                    if (message.hasOwnProperty("watch")) {
                        var mystream = getStream(message.watch, {});
                        mystream.register(ws);
                        /// TO DO REMOVE REGISTER PING (10min)
                        
                        ws.send(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(mystream.data)}))

                    }
                    if (message.hasOwnProperty("pull")) {

                        var mystream = getStream(message.pull, {});
                        console.log("-************");
                        ws.send(JSON.stringify({type: "pull", watch: message.pull, data: JSON.stringify(mystream.data)}))

                    }
                    if (message.hasOwnProperty("push")) {

                        var t = message.push.split("/").slice(1, -1);
                        //UPDATE FROM DB
                        if (t[0]) {
                            if (t[1]) {
                                var entity = $db[t[0]];
                                var object = entity.map(function (d) {
                                    return d.id;
                                }).indexOf(parseInt(t[1]));
                                entity[object] = message.data;
                            }
                        }

                        
                        if(PERISISTENCE.hasOwnProperty(t[0])){
                                var rooms=PERISISTENCE[t[0]].rooms;
                                for(var i in rooms){
                                    var room=rooms[i];
                                    var cash = room.getCash();
                                    
                                      for (var j in cash) {
                                        cash[j].reload(); /// TO DO APPLY SCOPE BY RULES
                                        cash[j].broadcast();
                                      }
                                }
                                console.log("PERISISTENCE");
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            });
        });

        return {
            getStream: getStream
        };

    }
})();
