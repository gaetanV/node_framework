@Service({
    selector: "ws",
    provider: [
        "ws",
        "parameters",
        "cache",
        "$event",
        "nodeUuid"
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
        
        wss.on('connection', connection);
        this.get("$event").on("updateEntity", updateEntity);
        
        ///////////////////
                
        function connection(ws){
            ws.id = this.get("nodeUuid").v4();
            clients[ws.id] = ws;
            ws.send(JSON.stringify({type: "MESSAGE", data: "now you can register @stream"}));
        }
        
        function updateEntity(d){
            
        }
        
    }
    
 
    
}