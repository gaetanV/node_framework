(function () {
    'use strict';
    var UserController=   {
  
            getAllAction:function() {
                this.get("mail");
   
                return this.render('All User');
             
             },
             getOneAction:function(id) {
                 
               return this.render('one user'+this.request.get("id"));
           
             }
     
    };
    module.exports = UserController;
})();