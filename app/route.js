(function () {
    'use strict';

    function Root(app,express) {
        
        
         var PATH = require("path");
         var RESTRICT=[];
         var INDEX="index.html";
        var yaml = require('js-yaml');
        var fs = require('fs');
        var bundleController = require('./controller.js');
  
        var doc = yaml.safeLoad(fs.readFileSync(PATH.join(__dirname,"./config.yml"), 'utf8'));
        if(doc.hasOwnProperty("restrict")){
                for(var i in doc.restrict){

                      
                      RESTRICT.push(doc.restrict[i]);
                                      
                }
        }
         if(doc.hasOwnProperty("index")){
             INDEX=doc.index;
         }
        
        function getParam(route,req){
            var params=[];
            for (var key in route.requirements) {
                        if (!req.params.hasOwnProperty(key)) {
                            throw "error route param no match requirements " + key;
                        }
                        var m=new RegExp('^'+route.requirements[key]+'$', 'gi');
                        console.log(m);
                        if (!req.params[key].match(m)) {
                            throw "error route param no match requirements " + key + " :: " +route.requirements[key];
                        }
                        params.push(req.params[key]);
                    };
                    return params;
        }
        function addGet(controller, route) {
            app.get(route.path, function (req, res, next) {
               
                try {
                    var params=getParam(route,req);
                    
                    console.log("GET match " + route.path);
                    controller.exec(req, res, next, route.fn,params)
                } catch (err) {
                    res.status(404).send(err);
                    return false;
                };
            });
        }
        ;

        return {
            add: function (path, racine) {
                var $bundles = [];
                try {
                    var doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
                    for (var i in doc) {
                        var route = doc[i];
                        if(route.defaults.hasOwnProperty("_controller")){
                                    var c = route.defaults._controller;
                              var controller = c.split(":");
                              var bundleName = controller[0];
                              var controllerName = controller[1];
                              // route.path.match(/{([^{}]*)}/g).map(function(m) { return m.slice(1, -1); });
                              var route = {
                                  methods: route.methods.map(function (m) {
                                      return m.toUpperCase()
                                  }),
                                  fn: controller[2] + "Action",
                                  path: racine + route.path.replace(/{([^}]*)}/g, ":$1"),
                                  requirements: route.requirements
                              }
                              if (!$bundles[bundleName]) {
                                  $bundles[bundleName] = []
                              };
                              if (!$bundles[bundleName][controllerName]) {
                                  $bundles[bundleName][controllerName] = []
                              }
                              ;
                              $bundles[bundleName][controllerName].push(route);
                        }
                    }
                    ;
                } catch (e) {
                    console.log(e);
                }

                for (var i in $bundles) {
                    for (var j in $bundles[i]) {
                        var bController = new bundleController(i, j);
                       
                        for (var k in $bundles[i][j]) {
                                 
                            var route = $bundles[i][j][k];
                            //// methods TO DO 
                            addGet(bController, route);

                        }
                    }
                }
            },
            public:function(redirect,staticpath){
                    var index=+INDEX;
                   var path=PATH.join(__dirname,'../',staticpath,'htacess.yml');
                 
                   var restricts=RESTRICT.slice(0);
                     
                   if (fs.existsSync(path)) {
                                   
                                var doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
                                if(doc.hasOwnProperty("restrict")){
                                        for(var i in doc.restrict){


                                              restricts.push(redirect+doc.restrict[i]);

                                        }
                                }
                                   if(doc.hasOwnProperty("index")){
                                       index= doc.index;
                                       
                                   }
                               
                    }
                   
                    function restrict(req, res, next){
                        console.log(req.path);
                        try{
                            for(var i in restricts){
                                var m=new RegExp('^'+restricts[i]+'$', 'gi');
                                console.log(m);
                                 if (req.path.match(m)) {
                                   throw "not allow";
                               }
                           }
                           console.log("ok");
                           next();
                        }catch (err) {
                            res.status(404).send(err);
                            return false;
                        };  
                    }
            
                   app.use(redirect,restrict,express.static(staticpath, { index: index}));
                   
            }
            
        }
    }
    module.exports = Root;
})();

