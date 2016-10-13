(function () {

    'use strict';
    var UserController=   {
  
            getAllAction:function() {
                this.get("mail");
                return this.render('index.html');
             
             },
             getOneAction:function(id) {
               
                 console.log(this.request.get("id"));
               return this.send('one user'+id);
           
             }
     
    };
    module.exports = UserController;
})();