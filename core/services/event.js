(function () {
    'use strict';
    module.exports = Event;
    function Event( $app,$yaml,$path, $db,$fs ,router,path) {
        
        
          $app.post(path ? path : "/news/", function (req, res, next) {
              //SEE ROLE IN SESSION //SEE IDUSER IN SESSION //CHECK ROLE & MATCH ID SPACE  //GET DATA
          });
              
          function emit(name,rolespace,idspace,data){
                  for(var i in $db.user){
                      console.log($db.user[i]);
                  }
          };
          
          return {
             emit:emit,
          };
    }
})();