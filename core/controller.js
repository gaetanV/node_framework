(function () {
    'use strict';
    require=function(){};
    var ControllerBundle = function ( actions,templating,parser, view,$app,$path) {
        var vm = this;
        this.templating=templating;
        //this.bundle = bundle;
       
        this.controller=actions;
       
     
       
        var GET = {
            getParam: function (route, req) {
                var params = [];
                for (var key in route.requirements) {
                    if (!req.params.hasOwnProperty(key)) {
                        throw "error route param no match requirements " + key;
                    }
                    var m = new RegExp('^' + route.requirements[key] + '$', 'gi');
                    console.log(m);
                    if (!req.params[key].match(m)) {
                        throw "error route param no match requirements " + key + " :: " + route.requirements[key];
                    }
                    params.push(req.params[key]);
                }
                ;
                return params;
            },
            exec: function (options, req, res, next) {
                var fn = options.fn;
                var params = options.params;
                console.log(fn);
                if (typeof vm.controller[fn] !== "function") {
                    throw "error function"
                }
                ;

                console.log("bundle : " + vm.bundle);
 
                console.log("function : " + fn);
                var bundle = vm.bundle;
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
                            console.log(vm.templating);
                            console.log(param);
                            res.end( parser(path,param));
                            //res.sendFile($path.join(view, path));
                            //  res.sendFile(PATH.join(__dirname,'../src',this.bundle,'/Ressources/',path));
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
                    var params = GET.getParam(route, req);
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