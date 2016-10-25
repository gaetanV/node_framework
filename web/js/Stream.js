var Stream
(function () {
    'use strict';
    Stream = function (ip) {
           var streams=document.querySelectorAll("[data-stream]");
             
                var WATCH = []; 
                 
        var watch=function (path, param, callback) {

                WATCH[path] = {
                    fn: callback,
                    param: param,
                    send: JSON.stringify({watch: path, param: param})
                };
            }
             
             
            for(var i=0; i< streams.length ; i++){
                var t=function(){
                     
                     var stream=streams[i];

                    watch(stream.getAttribute("data-stream"),{},function(data){ stream.innerHTML =data;}); 
                     
                 }();
            }

        
    /*
    s.watch("/user/1/",{},function(data){
                      document.querySelector("#user1").innerHTML = "<div>" + data + "</div>";
                    
                });
                s.watch("/user/",{},function(data){
                      document.querySelector("#users").innerHTML = "<div>" + data + "</div>";
                    
                });
                */
        
        var info=function(data){}
        var ws = new WebSocket(ip);
        ws.onmessage = function (e) {
            try {
                var data = JSON.parse(e.data);
                if (!data.hasOwnProperty("type")) {
                    throw "error"
                }
                switch (data.type) {
                    case "MESSAGE":
                        if (!data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        info(data.data);
                     
                        break;
                    case "data":
                        if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        if (WATCH[data.watch]) {
                            WATCH[data.watch].fn(data.data);
                        }
                }
            } catch (err) {
                console.log(e);
            }
        };
        ws.onopen = function () {
            for (var i in WATCH) {
                ws.send(WATCH[i].send);
                
            }
        }
   
    
        return {
            watch:watch,
            info: function (callback) {
                info=callback;
            }
            

        }
    }
 
})();