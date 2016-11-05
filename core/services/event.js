(function () {
    'use strict';
    module.exports = Event;
    function Event( ) {
        var TASK=[];
        
        function on(namespace,callback){
             if(!TASK[namespace]) TASK[namespace]=[];
             TASK[namespace].push(callback);
             
        }
              
          function emit(namespace,data){
              if(TASK[namespace]){
                  for(var i in TASK[namespace]){
                      TASK[namespace][i](data);
                  }
              }  
          };
          return {
             on:on,
             emit:emit,
          };
    }
})();