(function () {
    'use strict';
    module.exports = Polling;
    function Polling( $app,$bundles,$event,$yaml,$path,$fs ,router,path,cache) {
        var clients=[];
        const stream = this.execLib("stream",
            [clients,  this.execLib("cache",[cache?cache:"memory"])]
        );
        
        var reload=false;
     
        
        if ($bundles) {
            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
            stream.addRoute(config,$bundles);
        }
        
        this.execLib("poll",[
            $app,
            path? path : "/event/",
            reload,
            stream,
            clients
        ]);
        
        $event.on("updateEntity",function(d){
             stream.updateEntity(d.entity,d.id,d.data);
        });
    }
})();