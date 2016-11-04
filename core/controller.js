(function () {
    'use strict';
    require=function(){};
    var ControllerBundle = function ( actions,streams,SERVICE,parser,$app) {
        var vm = this;
        this.stream=streams;
        this.action=actions;
        var GET = {
            getParam: function (route,res, req) {
                try{
                    var params = [];
                    for (var key in route.requirements) {
                        if (!req.params.hasOwnProperty(key)) {
                            throw "error route param no match requirements " + key;
                        }
                        var m = new RegExp('^' + route.requirements[key] + '$', 'gi');
                        if (!req.params[key].match(m)) {
                            throw "error route param no match requirements " + key + " :: " + route.requirements[key];
                        }
                        params.push(req.params[key]);
                    }
                    ;
                    return params;
                }catch(err){
                    res.status(401).send(err);
                }
            },
            exec: function (options, req, res, next) {
                var fn = options.fn;
                var params = options.params;
            
                if (typeof vm.action[fn] !== "function") {
                    throw "error function"
                };
               
                vm.action[fn].apply({
                    
                    get:  function (service_name) {
                        if(SERVICE[service_name]){
                            return SERVICE[service_name]
                        }
                        
                    },
                    send: function (string) {
                        try {
                            res.end(string);
                        } catch (err) {

                            return false;
                        }
                        ;
                    },
                    request: {
                        get: function (key) {
                            return req.params[key];
                        }

                    },
                    render: function (path,param) {
                        try {
                          
                            console.log(param);
                            res.end( parser(path,param));
                        } catch (err) {
                            console.log(err);
                            return false;
                        }
                        ;
                    }
                }, params);
            }
        };
        this.execStream=function(fn,params){
          
            var data= this.stream[fn].apply({
                    get:  function (service_name) {
                      
                        if(SERVICE[service_name]){
                            return SERVICE[service_name]
                        }
                        
                    },
                }, params);
           
               return data;
        }
        this.addGet = function (route) {
            
            $app.get(route.path, function (req, res, next) {
                var sess = req.session;
                
                try {
                    var params = GET.getParam(route, res, req);
                    console.log("GET match " + route.path);
                    next({fn: route.fn, params: params});

                } catch (err) {
                    res.status(404).send(err);
                    return false;
                }
                ;
            }, GET.exec);
        };
    };
    module.exports = ControllerBundle;
})();