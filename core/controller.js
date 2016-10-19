(function () {
    'use strict';
    require=function(){};
    var ControllerBundle = function ( actions,parser,$app) {
        var vm = this;

        this.controller=actions;
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
                console.log(fn);
                if (typeof vm.controller[fn] !== "function") {
                    throw "error function"
                };
                console.log("function : " + fn);
                vm.controller[fn].apply({
                    get:  function (service) {
                        if (service = "mail") {
                            console.log("mail is ready");
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
        }

        this.addGet = function (route) {
            $app.get(route.path, function (req, res, next) {
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