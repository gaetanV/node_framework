@Component({
    selector: "poll",
    provider: [
        "nodeUuid",
        "$app"
    ]
})
class {

    constructor(
        path,
        reload,
        stream,
        clients
    ) {
    
        const $nodeUuid = this.get("nodeUuid");
        const $app = this.get("$app");
        
        var TASKS = [];
        var clientsSession = [];

        const maxinstance = 20;

        const timeDos = 100;
        var BUFFER = this.component("buffer");
  
        var CLIENT = this.component("client");
        
        $app.post(path, function (req, res, next) {
            console.log("POST");
            try {
                if (!clientsSession[req.sessionID]) {
                    clientsSession[req.sessionID] = new CLIENT(req.sessionID);
                } else {
                    if (Date.now() < clientsSession[req.sessionID].maxdate + timeDos) {
                        throw "prevent denial of service"
                    }
                }
                clientsSession[req.sessionID].garbage(clients);
                      
                if (!req.body.sid) {
                    var id = $nodeUuid.v4();
                    if (Object.keys(clientsSession[req.sessionID].instance).length < maxinstance) {
                        clientsSession[req.sessionID].addInstance(id, clients);
                        setTimeout(function () {
                            res.send(JSON.stringify({
                                type: "buffer",
                                data: JSON.stringify([
                                    JSON.stringify({type: "CONNECTION", sid: id}), JSON.stringify({type: "MESSAGE", data: "now you can register @event"})
                                ])
                            }))
                        }, timeDos);

                    } else {
                        throw "max connection for this session"
                    }
                } else {


                    var clientID = req.body.sid;
                    var buffer = [];
                    var watch = req.body.watch;
                    var pull = req.body.pull;

                    var processed = 0;
                    var nbpull = pull ? pull.length : 0;//+watch.length;
                    var nbwatch = watch ? watch.length : 0;//+watch.length;
                    var nbTask = nbpull + nbwatch;

                    function checkwatch(message, mystream) {
                        mystream.register(clients[clientID]);
                        mystream.cache.getData(function (data) {
                            buffer.push(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(data)}));
                            processed++;
                            if (processed >= nbTask) {
                                send();
                            }
                        });

                    }

                    for (var i in watch) {
                        var message = JSON.parse(watch[i]);
                        var mystream = stream.getStream(message.watch, {});

                        if (!mystream.client[clientID]) {
                            checkwatch(message, mystream);
                        } else {
                            nbTask--;
                        }
                    }
                    for (var i in pull) {
                        var message = JSON.parse(pull[i]);
                        var mystream = stream.getStream(message.pull, {});
                        mystream.cache.getData(function (data) {
                            buffer.push(JSON.stringify({type: "pull", watch: message.pull, data: JSON.stringify(data)}));
                            processed++;
                            if (processed >= nbTask) {
                                send();
                            }
                        });


                    }
                    function send() {
                        res.send(JSON.stringify({type: "buffer", data: JSON.stringify(buffer)}));
                    }

                    if (nbTask == 0) {
                        checkUpdate(req, res);
                    }

                }
            } catch (err) {
                console.log(err);
                res.status(401).send(err);
            }
        });

        function checkUpdate(req, res) {
            try {
                var sid = req.body.sid;
                if (TASKS[sid]) {
                    res.send(JSON.stringify(
                        {type: "buffer", data: JSON.stringify(TASKS[sid].data)}
                    ));
                    TASKS[sid] = false;
                } else {
                    if (reload) {
                        res.phase++;
                        if (res.phase >= 25) {
                            res.send("reload");
                        } else {
                            setTimeout(function () {
                                checkUpdate(req, res)
                            }, 1000);
                        }
                    } else {
                        res.send("nope");
                    }

                }
            } catch (err) {
                res.status(401).send(err);
            }
        }
    }
}