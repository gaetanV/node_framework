(function () {
    'use strict';
    module.exports = Ws;
    function Ws($fs, $yaml, $path, $bundles,$event, $host,port, router, access_control) {
     
        
        
        
        const WebSocketServer = require('ws').Server;
        const guid = require('./lib/guid.js');
        const wss = new WebSocketServer({port: port?port:8098, host: $host});
        var clients = [];
        const stream = require('./lib/stream.js')( clients,guid,$fs,$path);
        if ($bundles) { stream.addRoute($yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8')), $bundles);}
        
        wss.on('connection', function (ws) {
            ws.id = guid();
            clients[ws.id] = ws;
            ws.send(JSON.stringify({type: "MESSAGE", data: "now you can register @stream"}));
            ws.on('close', function () {delete clients[ws.id];});
            ws.on('message', function (param) {
                console.log(process.memoryUsage());
                try {
                    var message = JSON.parse(param);
                    if (message.hasOwnProperty("watch")) {
                        var mystream = stream.getStream(message.watch, {});
                        mystream.register(ws);
                        /// TO DO REMOVE REGISTER PING (10min)
                        mystream.cache.getData(function(data){
                              ws.send(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(data)}))
                            
                        });
                        
                       
                    }
                    if (message.hasOwnProperty("pull")) {
                        var mystream = stream.getStream(message.pull, {});
                        mystream.cache.getData(function(data){
                             ws.send(JSON.stringify({type: "pull", watch: message.pull, data: JSON.stringify(data)}))
                            
                        });
                       
                    }
            
                } catch (err) {
                    console.log(err);
                }
            });
        });
        $event.on("updateEntity",function(d){
             stream.updateEntity(d.entity,d.id,d.data);
            
        });
        
        
  
    }
})();
