var Stream;
(function () {
    'use strict';
    Stream =function(){
            this.WATCH = [];
            this.PULL = [];
            this.PUSH=[];
            this.info = function (data) {};
            this.session = false;
            var vm=this;
            
            function switchResponse(data) {
                    console.log(data);
                    if (!data.hasOwnProperty("type")) {
                        throw "error"
                    }
                    switch (data.type) {
                        case"CONNECTION":
                            vm.session = data.sid;
                            break;
                        case "MESSAGE":
                            if (!data.hasOwnProperty("data")) {
                                throw "error"
                            }
                            vm.info(data.data);
                            break;
                        case "data":
                            console.log("data");
                            if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                                throw "error"
                            }
                            if (vm.WATCH[data.watch]) {
                                vm.WATCH[data.watch].fn(data.data);
                            }
                            break;
                        case "pull":
                            console.log("pullLong");
                            if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                                throw "error"
                            }
                            if (vm.PULL[data.watch]) {
                                vm.PULL[data.watch].fn(data.data);
                                delete vm.PULL[data.watch];
                            }
                            break;

                        case "push":
                            console.log("push");
                            if (!data.hasOwnProperty("watch") || !data.hasOwnProperty("data")) {
                                throw "error"
                            }
                            if (vm.PUSH[data.watch]) {
                                vm.PUSH[data.watch].fn(data.data);
                                delete vm.PUSH[data.watch];
                            }
                            break;
                    }
                    ;
                }
                this.parseResponse=function(e){
                  try {
              
                    var data = JSON.parse(e);
             
                    if (!data.hasOwnProperty("type")) {
                        throw "error"
                    }
                    if(data.type=="buffer"){
                        console.log("buffer");
                        var data = JSON.parse(data.data);
                        for(var i in data){
                           switchResponse(JSON.parse(data[i]));
                        }
                    }else{
                        switchResponse(data);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            
            
            
             this.pull = function (path, param, callback) {
                var data = JSON.stringify({pull: path, param: param});
            
                vm.PULL[path] = {
                        fn: callback,
                        param: param,
                        send: data
                };

            }
             this.push = function (path, param, data,callback) {
                var data = JSON.stringify({push: path, param: param,data:data});
           
                vm.PUSH[path] = {
                        fn: callback,
                        param: param,
                        send: data
                };

            }

            this.watch = function (path, param, callback) {
                 var data = JSON.stringify({watch: path, param: param});
              
                 vm.WATCH[path] = {
                        fn: callback,
                        param: param,
                        send: data
                  };

            };

        }
        
        
        
        
})();
