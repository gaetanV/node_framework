(function () {
    'use strict';
    module.exports = Polling;
    function Polling( $app,$bundles,$yaml,$path, $db,$fs ,router,path) {
 
        var clients=[];
        const guid = require('./lib/guid.js');
        const stream = require('./lib/stream.js')($db,clients,guid,$fs,$path);
        
        var reload=false;
        var path= path? path : "/polling/";
        
        if ($bundles) {
            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
            stream.addRoute(config,$bundles);
        }
        
        require('./lib/poll.js')($app,path,reload,stream,clients);

        
        return {
              updateEntity: stream.updateEntity
        }
   
      

    }
})();