(function () {
    'use strict';
    
    function evalController(controller,name){
          require=false;
          var actions=[];
          var Controller=function(controller){
              
              for(var i in controller){
                   var m=new RegExp('^(.*)Action$', 'gi');
                  var actionName= m.exec(i);
                   if(actionName){
                       actions[actionName[1]]=controller[i];
                   }
                 
              }
              
          }
          eval(controller);
          return actions;  
    };
    
    var  Bundle = function (bundle,SERVICE,$fs,$path,$app,$controller,onload) {
        this.name=bundle.name;
        this.path=bundle.path;
        this.templating=bundle.templating;
        this.views=[];
        this.controllers=[];
         var vm=this;
        try{
              
             var path=$path.join(__dirname, "../src/",vm.path,"/Controller/"); 
             var pathView=$path.join(__dirname, "../src/",vm.path,"/Ressources/","views"); 
             $fs.statSync(path);
             $fs.readdir(path, function (err, files) {
               
                  if (err) {
                      throw err;
                  }
                  files.forEach(function (file) {
                        var m=new RegExp('^(.*)Controller.js$', 'gi');
                     
                        var controllerName= m.exec(file);
                        if(controllerName){
                            var include=require;
                             var controller=$fs.readFileSync($path.join(path,file), 'utf8');
                             var actions= evalController(controller,controllerName[1]);
                             var view=$path.join(__dirname, "../src/",vm.path,"Ressources","/views/"); 
                             var parser=false;
                             switch (vm.templating){
                                 default: 
                                     throw vm.templating + " templating is not in charge"
                                 case "html":
                                     parser=function(path,param){
                                        return vm.views[path];
                                     }
                                     break;
                                 case "jade":
                                 case "pug":
                                     var pug = include('pug');
                                     parser=function(path,param){
                                         return pug.render(vm.views[path],param);
                                    }
                                     break;
                                 case "mustache":
                                     var Mustache = include('Mustache');
                                     parser=function(path,param){
                                    
                                        return  Mustache.render(vm.views[path],param);
                                     }
                                     break;
                         
                                     
                             }
                             
                           
                             vm.controllers[controllerName[1]]=new $controller(actions,SERVICE,parser, $app);
                          
                        }
 
                  });
                  
                  
       
                  $fs.statSync(pathView);
                  $fs.readdir(pathView, function (err, files) {
                    
                        files.forEach(function (file) {
                            var view=$fs.readFileSync($path.join(pathView,file), 'utf8');
                            
                            

                            vm.views[file]=view;
                        });
                        onload();
                      
                   });
                   
                   
                   
             
              
                   
             });
             
          
        }catch(err){
           
               console.log(err);
        }
     }
     
    
    
     module.exports = Bundle;
     
    
    
    
    
})();