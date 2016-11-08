(function () {
    'use strict';
    module.exports = Polling;
    function Polling( $app,$bundles,$event,$yaml,$cache,$uuid,$path,$fs ,router,path,cache_type) {
        
       var clients=[];
       const cache= $cache(cache_type?cache_type:"memory");
       const stream = this.use("/Component/stream").inject({clients:clients,CACHE:cache});
        
        var reload=false;
     
        
           if ($bundles) {
            stream.addRoute($yaml.safeLoad($fs.readFileSync($path.join(this.container.getParameter("server.root_dir"), router.resource), 'utf8')), $bundles);
        }
        
        this.use("/Component/poll").inject({
            path:path? path : "/event/",
            reload:reload,
            stream:stream,
            clients:clients
        });
        
        $event.on("updateEntity",function(d){
             stream.updateEntity(d.entity,d.id,d.data);
        });
        
    }
})();