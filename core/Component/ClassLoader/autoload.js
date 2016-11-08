(function () {
    'use strict';
     const $path = require("path");
     function autoload(path,injection){
            var injection=injection;
            return function(namespace){
 
                           var fn=require($path.join(path,namespace+".js"));

                           fn.inject=function(args){

                               return  injection.apply(fn,args);
                           }
                           
                           
                           // $service($path.join(__dirname, "../",namespace)); 
                           return  fn;
                
            }
         
     
     }   
     module.exports = autoload;
     
})();