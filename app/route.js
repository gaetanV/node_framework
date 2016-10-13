(function () {
    'use strict';

    function Root(app) {
        var yaml = require('js-yaml');
        var fs = require('fs');
        var bundleController = require('./controller.js');
        var path=__dirname;
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
                        }
                        ;
                        if (!$bundles[bundleName][controllerName]) {
                            $bundles[bundleName][controllerName] = []
                        }
                        ;
                        $bundles[bundleName][controllerName].push(route);
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
            }
        }
    }
    module.exports = Root;
})();

