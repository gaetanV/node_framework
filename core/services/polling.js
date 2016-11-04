(function () {
    'use strict';
    module.exports = Polling;
    function Polling( $app,$bundles,$event,$yaml,$path,$fs ,router,path) {
 
        var clients=[];
        const guid = require('./lib/guid.js');
        const stream = require('./lib/stream.js')(clients,guid,$fs,$path);
        
        var reload=false;
        var path= path? path : "/polling/";
        
        if ($bundles) {
            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
            stream.addRoute(config,$bundles);
        }
        
        require('./lib/poll.js')($app,path,reload,stream,clients);

        
  
        $event.on("updateEntity",function(d){
             stream.updateEntity(d.entity,d.id,d.data);
            
        });
        

    }
})();