(function () {
    'use strict';
    
    function Route($app,methods,requirements,fn,path,parser,services){
        
         function parseParams(reqParams){
                     var params = [];
                     for (var key in requirements) {
                            if (!reqParams.hasOwnProperty(key)) {
                                throw "error route param no match requirements " + key;
                            }
                            var m = new RegExp('^' + requirements[key] + '$', 'gi');
                            if (!reqParams[key].match(m)) {
                                throw "error route param no match requirements " + key + " :: " + requirements[key];
                            }
                            params[key]=(reqParams[key]);
                        };
                        
                        return params;
         }
         for(var i in methods){
             var method=methods[i];
             switch(method){
                 case "GET":
                    $app.get(path, function (req, res, next) {
                        try{
                             var params = parseParams(req.params); 
                             fn.apply({
                             
                                render: function (path, param) {
                                    try {

                                        res.end(parser(path, param));
                                    } catch (err) {
                                        console.log(err);
                                        return false;
                                    }
                                    ;
                                },
                                 request: {
                                    get: function (key) {
                                        return req.params[key];
                                    }
                                 }, 
                             },params);
                            // res.status(401).send("GET");
                        }catch(err){
                            console.log(err);
                            res.status(401).send("ERROR");
                        }
                    });
                    break;
                case "POST":
                    $app.post(path, function (req, res, next) {
                        try{
                             var params = parseParams(req.params);
                               fn.apply({
                                   get: function (namespace) {
                                       return services[namespace];
                                   },
                                   render: function (path, param) {
                                       try {
                                           res.end(parser(path, param));
                                       } catch (err) {
                                           console.log(err);
                                           return false;
                                       }
                                       ;
                                   },
                                    request: {
                                       get: function (key) {
                                           return req.params[key];
                                       }
                                    }, 
                               },params);
                              
                          
                                //res.status(401).send("POST");
                        }catch(err){
                              console.log(err);
                                 res.status(401).send("ERROR");
                        }
                    });
                    break;
             }   
         }   
    }

    module.exports = Route;
})();




/*
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
 */