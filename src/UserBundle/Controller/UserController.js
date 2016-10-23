(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
      
                return this.render('index.pug',{name:"dynamic"});
             
             },
             getOneAction:function(id) {
               
                var socket=this.get("ws");
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