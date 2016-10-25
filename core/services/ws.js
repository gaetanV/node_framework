(function () {
    'use strict';
    module.exports = Ws;
    function Ws(inject, params) {
        var WebSocketServer = require('ws').Server;
        var port = params.port | 8098;
        var $fs = inject.$fs;
        var $yaml = inject.$yaml;
        var $path = inject.$path;
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

        function SPACE(data, index, path) {
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
            this.data = data;
            this.broadcast = function (data) {
                var user = 1; // FROM SESSION
                this.date.update = {date: Date.now(), user: user};
                this.data = data;
     
                for (var i in this.client) {
                    try {
                        var client = clients[i];
                        client.send(
                                JSON.stringify(
                                        {type: "data", watch: this.path, data: JSON.stringify(this.data)}

                                )
                                );


                    } catch (e) {
                        delete this.client[i];
                    }
                }
            }
        }
        function ROOM(path, fn, requirements) {
            this.fn = fn;
            this.path = path;
            this.requirements = requirements;

            var cash = [];

            this.getSpace = function (param, option, path) {
                var o = JSON.stringify(option);
                var p = JSON.stringify(param);
                var index = (p != undefined ? p : "{}") + "-" + (o != undefined ? o : "{}");
                if (!cash.hasOwnProperty(index)) {
                    cash[index] = new SPACE(this.fn.apply(
                            {},
                            Object.keys(param).map(function (k) {
                        return param[k]
                    }
                    )), index,
                            path);
                }
                return cash[index];
            }
        }

        if (inject.$bundles) {
            var BUNDLES = inject.$bundles;
         


            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", params.router.resource), 'utf8'));
            for (var i in config) {
                var c = config[i].defaults["_controller"];
                var controller = c.split(":");
                var bundleName = controller[0];
                var controllerName = controller[1];
                var fn = controller[2];

                var option = {
                    path: config[i].path,
                    fn: BUNDLES[bundleName].controllers[controllerName].controller[fn],
                    requirements: config[i].requirements ? config[i].requirements : {}
                }
                setStream(new ROOM(option.path, option.fn, option.requirements));
            }
        }

        var wss = new WebSocketServer({port: port, host: inject.$host});
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
                try{
                    var message = JSON.parse(param);
                    if (message.hasOwnProperty("watch")) {
                        var mystream = getStream(message.watch, {});
                        mystream.register(ws);
                        ws.send(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(mystream.data)}))

                    }
                }catch(err){
                    console.log(err);
                }
            });
        });

        return {
            getStream: getStream
        };

    }
})();