(function () {
    'use strict';
     var ControllerBundle =function (bundle,controller) {
         this.bundle=bundle;
         this.controller= require("./" + bundle + "/Controller/" + controller + "Controller.js");
         var resIn;
         
         
         this.get=function(service){
             if(service="mail"){
                 console.log("mail is ready");
             }
         }

         this.render=function(string){ 
                try {
                       resIn.end(string);
                } catch (err) {
                    
                    return false;
                };
         }
         
         
         this.exec=function(req, res, next,fn,params){
             console.log(fn);
                      if (typeof this.controller[fn] !== "function") {throw "error function"};
                       resIn=res;
                    
                        for(var key in params){
                            
                         console.log(key);
                        }
                      console.log("bundle : "+this.bundle);
                      console.log("controller : "+controller+"Controller");
                      console.log("function : "+fn);
                      this.controller[fn].call({
                          get:this.get,
                          render:this.render,
                          request:{
                              get:function(key){
                                  return params[key];
                              }
                              
                          }
                      });
                      
                      
             
         }
       
         
     };
    module.exports = ControllerBundle;
})();