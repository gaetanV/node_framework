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
                 var event=this.get("event");
                 
                 
                //UPDATE IN DB
              /*  var stream=this.get("ws");
                var longpolling=this.get("longpolling");
                 var polling=this.get("polling");
                 */
                var object={name:Math.random(),id:parseInt(id)};
                
                event.emit("updateEntity",{entity:"user",id:id,data:object});
                
                
                /*
                stream.updateEntity("user",id,object);
                longpolling.updateEntity("user",id,object);
                polling.updateEntity("user",id,object);
                */
                
             /*   var event=this.get("event");
                event.emit("update",["ADMIN"],[],object);
                */
               // var space=this.get("ws").getStream("/user/"+id+"/",{});
             
             
                return this.send("object change");
           
             },
             getOneStream:function(id){
                
                 var db=this.get("db");
                /// GET FROM BD
                 var data= db.user[0];
              
                 return data;
                 
             },
             getAllStream:function() {
                  var db=this.get("db");
                   /// GET FROM BD
                   var data={users:{u:db.user.slice(0)}};
           
                 return data;
                  
             },
             
     
             
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();