@Service({
    selector: "ws",
    provider: [
        "ws",
        "parameters",
        "cache",
        "$event",
        "nodeUuid",
        "$bundles"
    ],
    params: [
        "cache_type",
        "port",
        "router",
        "access_control"
    ],
})
class{
    
    constructor(){
        
        var clients = [];

        const wss = new this.get("ws").Server({
            port: this.params("port")|| 8098,
            host: this.get("parameters").getParameter("server.host")}
        );
        
        const $cache = this.get("cache");
        const cache = $cache( this.params("cache_type") || "memory");
        const stream = this.component("stream")(clients, cache);
        const $bundles = this.get("$bundles");
        
        wss.on('connection', connection);
        this.get("$event").on("updateEntity", updateEntity);
        
        $bundles.forEach((a)=>{
            for(var i in  a.STREAM){
                stream.addRoute(a.STREAM[i]);
            }
        })
        
        ///////////////////
        var vm = this;
        
        function connection(ws){
            
            ws.id = vm.get("nodeUuid").v4();
            clients[ws.id] = ws;
            ws.send(JSON.stringify({type: "MESSAGE", data: "now you can register @stream"}));
            ws.on('close', close);
            ws.on('message', message);
            
            function close(){
                delete clients[ws.id];
            }
       
            function message(param) {
                
                try {
                    var message = JSON.parse(param);
                    if (message.hasOwnProperty("watch")) {

                        var mystream = stream.getStream(message.watch, {});
                        /// TO DO REMOVE REGISTER PING (10min)
                        if(mystream){
                            mystream.register(ws)
                            mystream.cache.getData(function (data) {
                                ws.send(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(data)}))
                            }); 
                        }


                    }
                    if (message.hasOwnProperty("pull")) {
                        var mystream = stream.getStream(message.pull, {});
                        if(mystream){
                            mystream.cache.getData(function (data) {
                                ws.send(JSON.stringify({type: "pull", watch: message.pull, data: JSON.stringify(data)}))

                            });
                        }

                    }

                } catch (err) {
                    console.log(err);
                }
            }
            
        }
        
        function updateEntity(d){
             stream.updateEntity(d.entity, d.id, d.data);
        }
        
    }
    
 
    
}