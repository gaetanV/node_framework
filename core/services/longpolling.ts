@Service({
    selector: "longpolling",
    provider: [
        "$app",
        "event",
        "jsYaml",
        "cache",
        "path",
        "fs",
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
        
        const $jsYaml = this.get("jsYaml"); 
        const $app = this.get("$app");
        const $cache = this.get("cache");
        const $path = this.get("path");
        const $event = this.get("event");
        const $fs = this.get("fs");
        const $bundles = this.get("$bundles");
        var clients = [];
        const cache = $cache(this.params("cache_type") || "memory");
        
        const stream = this.component("stream")(clients, cache);
        
        var reload = true;
        
        $bundles.forEach((a)=>{
            for(var i in  a.STREAM){
                stream.addRoute(a.STREAM[i]);
            }
        })
     
   
        
        this.component("poll")(
            this.params("path") || "/event/",
            reload,
            stream,
            clients,
        );

        $event.on("updateEntity", function (d) {
            stream.updateEntity(d.entity, d.id, d.data);

        });
      
    }
    
}