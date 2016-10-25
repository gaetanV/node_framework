(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
                var socket=this.get("ws");
                   var object=[{name:Math.random(),type:"sync"}, {name:Math.random(),type:"sync"}];
                var space=socket.getStream("/user/");
                if(space){
                     space.broadcast(object);
                    
                }
                return this.render('index.pug',{name:"objects change"});
             
             },
             getOneAction:function(id) {
               
                //UPDATE IN DB
                var object={name:Math.random(),type:"sync",id:id};
                var space=this.get("ws").getStream("/user/"+id+"/",{});
                if(space){
                     space.broadcast(object);
                    
                }
                
  
                return this.send("object change");
           
             },
             getOneStreamAction:function(id){
                 /// GET FROM BD
                 return {name:Math.random(),type:"sync",id:id};
                 
             },
             getAllStreamAction:function() {
                   /// GET FROM BD
                  return [{name:Math.random(),type:"sync"}, {name:Math.random(),type:"sync"}];
                  
             },
             
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();