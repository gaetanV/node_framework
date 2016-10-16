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
    
    var  Bundle = function (name,$fs,$path,$app,$controller,onload) {
        this.name=name;
        this.controllers=[];
         var vm=this;
        try{
             var path=$path.join(__dirname, "../src/",name,"/Controller/"); 
             $fs.statSync(path);
             $fs.readdir(path, function (err, files) {
                
                  if (err) {
                      throw err;
                  }
                  files.forEach(function (file) {
                        var m=new RegExp('^(.*)Controller.js$', 'gi');
                     
                        var controllerName= m.exec(file);
                        if(controllerName){
                             var controller=$fs.readFileSync($path.join(path,file), 'utf8');
                             var actions= evalController(controller,controllerName[1]);
                             var view=$path.join(__dirname, "../src/",name,"Ressources","/views/"); 
                             vm.controllers[controllerName[1]]=new $controller(actions,view, $app,$path);
                          
                        }
 
                  });
                  
                  onload();
             });
             
            
        }catch(err){
               console.log("err");
        }
     }
     
    
    
     module.exports = Bundle;
     
    
    
    
    
})();