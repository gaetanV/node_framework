(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
                var socket=this.get("ws");
                var space=socket.getRoom("public","flux");
                if(space){
                     space.broadcast("user get all action ");
                    
                }
                return this.render('index.pug',{name:"dynamic"});
             
             },
             getOneAction:function(id) {
               
                var socket=this.get("ws");
                var space=socket.getRoom("user",id);
                if(space){
                     space.broadcast({name:Math.random(),type:"sync"});
                    
                }
  
                return this.send('one user'+id);
           
             },
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();