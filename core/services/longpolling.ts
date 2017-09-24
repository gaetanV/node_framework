@Service({
    selector: "longpolling",
    provider: [
        "event",
        "cache",
        "$bundles",
    ],
    params: [
        "cache_type",
        "path",
        "router",
    ],
})
class{
    
    constructor() {
        
        var clients = [];
       
        //////////////////
        //  STREAM 
        //////////////////
        
        const stream = this.component("stream")(
            clients, 
            this.get("cache")(this.params("cache_type") || "memory")
        );
        
        this.get("$bundles").forEach((a)=>{
            for(var i in  a.STREAM){
                stream.addRoute(a.STREAM[i]);
            }
        })
        
        //////////////////
        //  POLL 
        //////////////////
        
        this.component("poll")(
            this.params("path") || "/event/",
            true,
            stream,
            clients,
        );
        
        //////////////////
        //  EVENT 
        //////////////////

        this.get("event").on("updateEntity", function (d) {
            stream.updateEntity(d.entity, d.id, d.data);
        });
      
    }
    
}