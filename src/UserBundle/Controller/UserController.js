(function () {
    'use strict';
    var UserController =   {
             setAllAction:function() {
               //UPDATE IN DB
                var socket=this.get("ws");
                var event=this.get("longpolling");
                
                var object=[{name:Math.random(),type:"sync"}, {name:Math.random(),type:"sync"}];
               // var space=socket.getStream("/user/");
       
                return this.render('index.pug',{name:"objects change"});
             
             },
             setOneAction:function(id) {
                //UPDATE IN DB
                var stream=this.get("ws");
                var longpolling=this.get("longpolling");
                 var polling=this.get("polling");
                 
                var object={name:Math.random(),id:parseInt(id)};
                
                stream.updateEntity("user",id,object);
                longpolling.updateEntity("user",id,object);
                polling.updateEntity("user",id,object);
                
                
                var event=this.get("event");
                event.emit("update",["ADMIN"],[],object);
                
               // var space=this.get("ws").getStream("/user/"+id+"/",{});
             
             
                return this.send("object change");
           
             },
             getOneStreamAction:function(id){
                 
                /// GET FROM BD
                 return this.db.user[0];
                 
             },
             getAllStreamAction:function() {
                   /// GET FROM BD
                 return {users:{u:this.db.user.slice(0)}};
                  
             },
             
     
             
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();