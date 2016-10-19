(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
                this.get("mail");
                return this.render('index.pug',{name:"dynamic"});
             
             },
             getOneAction:function(id) {
               
            
                 return this.send('one user'+id);
           
             },
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();