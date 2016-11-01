(function () {
    'use strict';
    module.exports = Ws;
    function Ws($fs, $yaml, $path, $db, $bundles, $host, port, router, access_control) {
    const WebSocketServer = require('ws').Server;
            const guid = require('./lib/guid.js');
            const wss = new WebSocketServer({port: port?port:8098, host: $host});
            var clients = [];
            const stream = require('./lib/stream.js')($db, clients);
            if ($bundles) {
        var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
        stream.addRoute(config, $bundles);
    }

    wss.on('connection', function (ws) {
        ws.id = guid();
        console.log("********** NEW   " + ws.id + "**********");
        clients[ws.id] = ws;
        ws.send(JSON.stringify({type: "MESSAGE", data: "now you can register @stream"}));

        ws.on('close', function () {
            console.log("********** DELETE   " + ws.id + "**********");
            delete clients[ws.id];
        });
        ws.on('message', function (param) {
            console.log(process.memoryUsage());

            try {
                var message = JSON.parse(param);
                if (message.hasOwnProperty("watch")) {
                    var mystream = stream.getStream(message.watch, {});
                    mystream.register(ws);
                    /// TO DO REMOVE REGISTER PING (10min)

                    ws.send(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(mystream.data)}))

                }
                if (message.hasOwnProperty("pull")) {

                    var mystream = stream.getStream(message.pull, {});
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
                    stream.updateEntity(t[0], t[1], message.data);
                
                    console.log("PERISISTENCE");

                }
            } catch (err) {
                console.log(err);
            }
        });
    });


    
    return {
        updateEntity: stream.updateEntity
    };

}
})();
