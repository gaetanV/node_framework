@Service({
    selector: "polling",
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
        
        const cache = this.get("cache")(this.params("cache_type") || "memory");
        const stream = this.component("stream")(clients, cache);
        
        this.get("$bundles").forEach((a)=>{
            for(var i in  a.STREAM){
                stream.addRoute(a.STREAM[i]);
            }
        })
        
        this.component("poll")(
            this.params("path") || "/event/",
            false,
            stream,
            clients,
        );

        this.get("event").on("updateEntity", function (d) {
            stream.updateEntity(d.entity, d.id, d.data);
        });

    }
    
}