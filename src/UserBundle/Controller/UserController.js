(function () {
    'use strict';
    var UserController =   {
             setAllAction:function() {
               //UPDATE IN DB

                var object=[{name:Math.random(),type:"sync"}, {name:Math.random(),type:"sync"}];

       
                return this.render('index.pug',{name:"objects change"});
             
             },
             setOneAction:function(id) {
                var event=this.get("event");
                var object={name:Math.random(),id:parseInt(id)};
                event.emit("updateEntity",{entity:"user",id:id,data:object});
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