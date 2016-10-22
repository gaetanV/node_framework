(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
                var socket=this.get("socket");
                var space=socket.getSpace("flux");
                console.log(space);
                if(space){
                    space.broadcast("one user get all action");
                }
              
                return this.render('index.pug',{name:"dynamic"});
             
             },
             getOneAction:function(id) {
               
                var socket=this.get("socket");
                var space=socket.getRoom("user",id);
                if(space){
                     space.broadcast("user "+id+" get one action ");
                    
                }
               
                
                
                return this.send('one user'+id);
           
             },
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();