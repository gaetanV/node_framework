(function () {
    'use strict';
    

    var UserController =   {
             setAllAction:function() {
               //UPDATE IN DB
                var socket=this.get("ws");
                var object=[{name:Math.random(),type:"sync"}, {name:Math.random(),type:"sync"}];
                var space=socket.getStream("/user/");
                if(space){
                     space.broadcast(object);
                    
                }
                return this.render('index.pug',{name:"objects change"});
             
             },
             setOneAction:function(id) {
                //UPDATE IN DB
                var object={name:Math.random(),type:"sync",id:id};
                var space=this.get("ws").getStream("/user/"+id+"/",{});
                if(space){
                     space.broadcast(object);
                    
                }
                
  
                return this.send("object change");
           
             },
             getOneStreamAction:function(id){
                 

                 return this.db.user[0];
                 
             },
             getAllStreamAction:function() {
                   /// GET FROM BD
      
                  return this.db.user;
                  
             },
             
     
             
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();