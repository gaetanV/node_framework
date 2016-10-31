(function () {
    'use strict';

    module.exports = LongPolling;
    function LongPolling( $app, path) {

        var maxinstance = 20;
        var timeInstance = 2000;
        var timeDos = 100;
        var path = path ? path : "/event/";
        var guid = require('./lib/guid.js');
        var stream = require('./lib/stream.js')();
        
        var clientsSession = [];
        var clients=[];
        
        var CLIENT = function (sessionID) {
           
            this.sessionID = sessionID;
            this.instance = [];
            this.maxdate = Date.now();
            this.garbage = function () {
                var vm = this;
                for (var i in vm.instance) {
                    var client = vm.instance[i];
                    if (client.update < (Date.now() + timeInstance)) {
                        delete vm.instance[i];
                        delete clients[i];
                    }
                }
            }
            this.addInstance = function (pollingId) {
                
                this.instance[pollingId] = {
                    sid: pollingId,
                    sessionID:this.sessionID,
                    create: {date: Date.now()},
                    update: {date: Date.now()},
                    send:function(){
                        
                    }
                }
                clients[pollingId]=this.instance[pollingId];
                this.maxdate = Date.now();
            }
        }
        

        $app.get(path, function (req, res, next) {
            try {
                console.log(clients);

                if (!clientsSession[req.sessionID]) {
                    clientsSession[req.sessionID] = new CLIENT(req.sessionID);
                } else {
                    if (Date.now() < clientsSession[req.sessionID].maxdate + timeDos) {
                        throw "prevent denial of service"
                    }
                }

                clientsSession[req.sessionID].garbage();


                if (!req.query.sid) {
                    var id = guid();

                    if (Object.keys(clientsSession[req.sessionID].instance).length < maxinstance) {
                        clientsSession[req.sessionID].addInstance(id);

                        res.cookie('eventID', id);
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
                    res.phase = 0;
                    checkUpdate(req, res);
                }

            } catch (err) {


                res.status(401).send(err);
            }
        });

        function checkUpdate(req, res)
        {
            try {
                res.phase++;
                if (res.phase >= 5) {
                    res.send(JSON.stringify({type: "MESSAGE", data: "HELLO"}));
                } else {
                    setTimeout(function () {
                        checkUpdate(req, res)
                    }, 1000);
                }
            } catch (err) {
                console.log(err);
            }

        }


    }
})();