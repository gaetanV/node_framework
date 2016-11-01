var Stream
(function () {
    'use strict';
    Stream = function (ip) {
        //var streams = document.querySelectorAll("[data-stream]");
        var WATCH = [];
        var PULL = [];
        var PUSH=[];

        /*
         for(var i=0; i< streams.length ; i++){
         var t=function(){
         
         var stream=streams[i];
         
         watch(stream.getAttribute("data-stream"),{},function(data){ stream.innerHTML =data;}); 
         
         }();
         }
         
         
         */

        var info = function (data) {};
        var ws = new WebSocket(ip);
        
         var pull = function (path, param, callback) {
            var data = JSON.stringify({pull: path, param: param});
            if (ws.load) {
                ws.send(data);
            };
            PULL[path] = {
                    fn: callback,
                    param: param,
                    send: data
            };
            
        }
         var push = function (path, param, data,callback) {
            var data = JSON.stringify({push: path, param: param,data:data});
            if (ws.load) {
                ws.send(data);
            };
            PUSH[path] = {
                    fn: callback,
                    param: param,
                    send: data
            };
            
        }

        var watch = function (path, param, callback) {
             var data = JSON.stringify({watch: path, param: param});
            if (ws.load) {
                ws.send(data);
            }
             WATCH[path] = {
                    fn: callback,
                    param: param,
                    send: data
              };
           
        };

        
        function switchResponse(data){
            //  console.log(data);
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
                        break;
                    case "pull":
                
                        if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        if (PULL[data.watch]) {
                            PULL[data.watch].fn(data.data);
                             delete PULL[data.watch];
                        }
                        break;
               
                    case "push":
                       
                        if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        if (PUSH[data.watch]) {
                             PUSH[data.watch].fn(data.data);
                             delete PUSH[data.watch];
                        }
                        break;
                }
                ;
        }
        ws.onmessage = function (e) {
            try {
              
                var data = JSON.parse(e.data);
                if (!data.hasOwnProperty("type")) {
                    throw "error"
                }
                if(data.type=="buffer"){
                    var data = JSON.parse(data.data);
                   
                    for(var i in data){

                       switchResponse(JSON.parse(data[i]));
                    }
                  
                }else{
                    switchResponse(data);
                }
         
            } catch (err) {
                console.log(e);
            }
        };

        ws.onopen = function () {
            ws.load=true;
            for (var i in WATCH) {
                ws.send(WATCH[i].send);

            }
            for (var i in PULL) {
                ws.send(PULL[i].send);

            }
            for (var i in PUSH) {
                ws.send(PUSH[i].send);

            }
        }


        return {
            push:push,
            pull: pull,
            watch: watch,
            info: function (callback) {
                info = callback;
            }

        }
    }

})();