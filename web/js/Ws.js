var Ws;
(function () {
    'use strict';
    Ws = function (ip,Stream) {
        
        var ws = new WebSocket(ip);
        var Stream=new Stream();
        ws.onmessage = function (e) {
            Stream.parseResponse(e.data);
        };

        ws.onopen = function () {
            ws.load=true;
            for (var i in Stream.WATCH) {
                ws.send(Stream.WATCH[i].send);

            }
            for (var i in Stream.PULL) {
                ws.send(Stream.PULL[i].send);

            }
            for (var i in Stream.PUSH) {
                ws.send(Stream.PUSH[i].send);
            }
        }

        return {
            push:function(path, param,data, callback) {
              if(ws){
               
                  var data = JSON.stringify({push: path, param: param,data:data});
                 if (ws.load) {ws.send(data);}
              }
              Stream.push(path, param,data, callback);
            },
            pull: function(path, param, callback) {
              if(ws){
                 var data = JSON.stringify({pull: path, param: param});
                 if (ws.load) {ws.send(data);}
              }
              Stream.pull(path, param, callback);
            },
            watch: function(path, param, callback) {
              if(ws){
                 var data = JSON.stringify({watch: path, param: param});
                 if (ws.load) {ws.send(data);}
              }
              Stream.watch(path, param, callback);
            },
            info: function (callback) {
                Stream.info = callback;
            }

        }
    }

})();