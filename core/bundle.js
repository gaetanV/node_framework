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
    
    var  Bundle = function (bundle,$fs,$path,$app,$controller,onload) {
           
        this.path=bundle.path;
        this.templating=bundle.templating;
        
        this.controllers=[];
         var vm=this;
        try{
              
             var path=$path.join(__dirname, "../src/",vm.path,"/Controller/"); 
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
                                     parser=$fs.readFileSync;
                                     break;
                                 case "jade":
                                 case "pug":
                                     var pug = include('pug');
                                     parser=pug.renderFile;
                                     break;
                                 case "mustache":
                                     var Mustache = include('Mustache');
                                     parser=function(path,param){
                                         
                                        return  Mustache.render($fs.readFileSync(path,'utf8'),param);
                                     }
                                     break;
                             }
                             
                           
                             vm.controllers[controllerName[1]]=new $controller(actions,vm.templating,parser,view, $app,$path);
                          
                        }
 
                  });
                  
                  onload();
                   
             });
             
          
        }catch(err){
           
               console.log(err);
        }
     }
     
    
    
     module.exports = Bundle;
     
    
    
    
    
})();