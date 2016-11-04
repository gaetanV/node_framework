(function () {
    'use strict';
     module.exports = service;
     function service(service,inject,$path){
            function getArguments(fn){
                var chaine=fn.toString().replace(/\n|\r|(\n\r)/g,' ').slice(0,200); 
                var re =/^function[\s]*([^\(]*)\(([^\)]*)\)[\s]*{/g;
                var match=re.exec(chaine);
     
                return match[2].replace(/ /g,'').split(",");
            }
            if (!service.hasOwnProperty("class")) {
                    throw ('ERROR IN CONFIG service')
            }
      
            var fn=     require($path.join(__dirname, "../", service.class+".js"));
            var args=getArguments(fn);
            
     
            var injectParam=[];
             if (service.hasOwnProperty("params")) {
                 for(var i in service.params){
                
                      var index=args.indexOf(i);
                     
                      if(index!==-1){
                          injectParam[index]=service.params[i];
                          
                      }
                 }
                
             }
             
            if (service.hasOwnProperty("arguments")) {
                console.log(service.arguments);
                for(var i in service.arguments){
                  
                    var index=args.indexOf(service.arguments[i]);
                     if(index!==-1){
                          if(!inject.hasOwnProperty(service.arguments[i])){throw "error we can't inject this argument" + i}
                           
                          injectParam[index]=inject[service.arguments[i]];
                      }

                }
            }
              
            console.log("injectParam");
            return  fn.apply({},injectParam);
     
     }   
})();