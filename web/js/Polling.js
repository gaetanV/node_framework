var Polling
(function () {
    'use strict';
    Polling = function (ip,Stream) {
        var Stream=new Stream();
        
        var connection=false;
        function callNode() {
            var data = {};
           
            if (Stream.session) {
                data.sid = Stream.session;
            }
            data.watch=[];
            data.pull=[];
            for (var i in Stream.WATCH){
                   data.watch.push(Stream.WATCH[i].send) ;
            }
            for (var i in Stream.PULL){
                   data.pull.push(Stream.PULL[i].send) ;
            }
           
            $.ajax({
                type:"POST",
                cache: false,
                url: ip,
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function (response, code, xhr) {
                   
                    if(response!=="nope"){
                      Stream.parseResponse(response);
                    }
                    
                    if(!connection){
                        callNode();
                        connection=true;
                    }
                  
                }
            });
        }
        callNode();

         return {
            watch: Stream.watch,
            pull:Stream.pull,
            info: function (callback) {
                Stream.info = callback;
            },
            check:callNode

        }
    }

})();