@Service({
    selector: "polling",
    provider: [
        "$app",
        "event",
        "jsYaml",
        "cache",
        "path",
        "fs",
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
        
        var clients = [];
        const cache = $cache(this.params("cache_type") || "memory");
        
        const stream = this.component("stream")(clients, cache);
        
        var reload = false;
        
        /*
        if ($bundles) {
            stream.addRoute($jsYaml.safeLoad($fs.readFileSync($path.join(this.container.getParameter("server.root_dir"), router.resource), 'utf8')), $bundles);
        }
        */
        
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