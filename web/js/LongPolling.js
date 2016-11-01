var LongPolling
(function () {
    'use strict';
    LongPolling = function (ip) {
        var info = function (data) {};
        var session = false;
        var WATCH = [];
        var PULL = [];
        var PUSH = [];


        function callNode() {
            var data = {};
            if (session) {
                data.sid = session;
            }
            data.watch=[];
            data.pull=[];
            for (var i in WATCH){
                   data.watch.push(WATCH[i].send) ;
            }
            for (var i in PULL){
                   data.pull.push(PULL[i].send) ;
            }
            

            function switchResponse(data) {
                console.log(data);
                if (!data.hasOwnProperty("type")) {
                    throw "error"
                }
                switch (data.type) {
                    case"CONNECTION":

                        session = data.sid;


                        break;
                    case "MESSAGE":
                        if (!data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        info(data.data);

                        break;
                    case "data":
                        console.log("data");
                        if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        if (WATCH[data.watch]) {
                            WATCH[data.watch].fn(data.data);
                        }
                        break;
                    case "pull":
                        console.log("pullLong");
                        if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                            throw "error"
                        }
                        if (PULL[data.watch]) {
                            PULL[data.watch].fn(data.data);
                            delete PULL[data.watch];
                        }
                        break;

                    case "push":
                        console.log("push");
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
                    if(response!=="reload"){
                        try {

                            var data = JSON.parse(response);
                            if (!data.hasOwnProperty("type")) {
                                throw "error"
                            }

                            if (data.type == "buffer") {
                                console.log("buffer");
                                  
                                  var data = JSON.parse(data.data);
                    console.log(data);
                                for(var i in data){

                                   switchResponse(JSON.parse(data[i]));
                                }

                            } else {
                                switchResponse(data);
                            }




                        } catch (err) {
                            console.log(err);
                        }
                    }
                    callNode();
                }
            });
        }
        ;
        callNode();

        var watch = function (path, param, callback) {
             var data = JSON.stringify({watch: path, param: param});
 
             WATCH[path] = {
                    fn: callback,
                    param: param,
                    send: data
              };
           
        };

        var pull = function (path, param, callback) {
            var data = JSON.stringify({pull: path, param: param});
     
            PULL[path] = {
                    fn: callback,
                    param: param,
                    send: data
            };
            
        }



        return {
            watch: watch,
            pull:pull,
            info: function (callback) {
                info = callback;
            }

        }
    }

})();