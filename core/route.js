(function () {
    'use strict';
    var $yaml = require('js-yaml');
    var $fs = require('fs');
    var $controller = require('./controller.js');
    var $bundle = require('./bundle.js');
    var $htaccess = require('./htacess.js');
    var $path = require("path");

    module.exports = Root;
    function Root($app, $express, onload) {
        $htaccess($app, $express, $fs, $yaml, $path);
        var BUNDLES = [];
        var ONLOAD = {
            add: function (path, racine) {


                try {
                    var doc = $yaml.safeLoad($fs.readFileSync(path, 'utf8'));
                    for (var i in doc) {
                        var route = doc[i];
                        if (route.defaults.hasOwnProperty("_controller")) {
                            var c = route.defaults._controller;
                            var controller = c.split(":");
                            var bundleName = controller[0];
                            var controllerName = controller[1];
                            // route.path.match(/{([^{}]*)}/g).map(function(m) { return m.slice(1, -1); });
                            var route = {
                                methods: route.methods.map(function (m) {
                                    return m.toUpperCase()
                                }),
                                fn: controller[2] ,
                                path: racine + route.path.replace(/{([^}]*)}/g, ":$1"),
                                requirements: route.requirements
                            }
                           
                            BUNDLES[bundleName].controllers[controllerName].addGet(route);
                        }
                    }
                    ;
                } catch (e) {
                    console.log(e);
                }


            },
        }
        var doc = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../app", "./config.yml"), 'utf8'));
        if (doc.hasOwnProperty("bundles")) {
            var all=Object.keys(doc.bundles).length;
            
            var cmp=0;
            function load(){
                cmp++;
                 console.log("load "+(all/cmp)*100+"%");
                if(cmp>=all){
                      onload(ONLOAD);
                }
               
            }
            for (var i in doc.bundles) {

                BUNDLES[i] = new $bundle(i, $fs, $path, $app, $controller,load);
            }
        };
      
    }

})();

