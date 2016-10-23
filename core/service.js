(function () {
    'use strict';
     module.exports = service;
     function service(service,inject,$path){
        
            if (!service.hasOwnProperty("class")) {
                    throw ('ERROR IN CONFIG service')
            }
            var injectArgument=[];
            var injectParam=[];
             if (service.hasOwnProperty("params")) {
                 injectParam=service.params;
             }
            if (service.hasOwnProperty("arguments")) {
                for(var i in service.arguments){
                  
                  //  if(!inject.hasOwnProperty(service.arguments[i])){throw "error we can't inject this argument"}
                    injectArgument[service.arguments[i]]=inject[service.arguments[i]];
                }
            }
              console.log(service.arguments[i]);
                  
            return  require($path.join(__dirname, "../", service.class+".js"))(injectArgument,injectParam);
     }   
})();