(function () {
    'use strict';
     var require=false;
     //!!!! STOP DYNAMIC INJECTION  !!!!//
     function autoload(path,injection,$fs,$path){
            var injection=injection;
            return function(namespace){
                          function parse(path){
                                var file=  $fs.readFileSync(path, 'utf8');
                               
                                eval(file);
                              
                               return module.exports;
                          }
                          var fn=parse($path.join(path,namespace+".js"));
                       
                         
                           fn.inject=function(args){
                               
                               return  injection.apply(fn,args);
                           }
                           
                           return  fn;
                
            }
         
     
     }   
     module.exports = autoload;
     
})();