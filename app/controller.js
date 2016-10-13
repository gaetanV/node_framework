(function () {
    'use strict';
     var ControllerBundle =function (bundle,controller) {
         var PATH = require("path");
         this.bundle=bundle;
         this.controller= require("../src/" + bundle + "/Controller/" + controller + "Controller.js");
         this.get=function(service){
             if(service="mail"){
                 console.log("mail is ready");
             }
         }
         this.exec=function(req, res, next,fn,params){
             console.log(fn);
                      if (typeof this.controller[fn] !== "function") {throw "error function"};
                 
                      console.log("bundle : "+this.bundle);
                      console.log("controller : "+controller+"Controller");
                      console.log("function : "+fn);
                      var bundle=this.bundle;
                      this.controller[fn].apply({
                          get:this.get,
                          send:function(string){ 
                                try {
                                       res.end(string);
                                } catch (err) {

                                    return false;
                                };
                          },
                          request:{
                              get:function(key){
                                  return req.params[key];
                              }
                              
                          },
                          render:function (path){
                                try {
                                    console.log(bundle);
                                   res.sendFile(PATH.join(__dirname,'../src',bundle,'/Ressources/','views',path));
                                     //  res.sendFile(PATH.join(__dirname,'../src',this.bundle,'/Ressources/',path));
                                } catch (err) {
                                    console.log(err);
                                    return false;
                                };
                          }
                      },params);
         }
       
         
     };
    module.exports = ControllerBundle;
})();