(function () {
    'use strict';
    module.exports = Ws;
    function Ws($fs, $yaml, $path, $bundles,$event,$uuid, $host,port, router, access_control,cache_type,$cache,$ws) {

        const WebSocketServer = $ws.Server;
        const wss = new WebSocketServer({port: port?port:8098, host: $host});
        const cache= $cache(cache_type?cache_type:"memory");
        var clients = [];
         const stream = this.use("/Component/stream").inject({clients:clients,CACHE:cache});
        
        
        if ($bundles) {
            stream.addRoute($yaml.safeLoad($fs.readFileSync($path.join(this.container.getParameter("server.root_dir"), router.resource), 'utf8')), $bundles);
        }
        
        wss.on('connection', function (ws) {
            ws.id = $uuid.v4();
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
