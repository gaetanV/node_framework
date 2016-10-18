(function () {
    'use strict';
    var UserController =   {
             getAllAction:function() {
                this.get("mail");
                return this.render('index.pug',{name:"dynamic"});
             
             },
             getOneAction:function(id) {
               
                 console.log(this.request.get("id"));
                 return this.send('one user'+id);
           
             },
             test:function(id) {
               
                 console.log(id);
              
           
             }
     
    };
    Controller(UserController);
})();