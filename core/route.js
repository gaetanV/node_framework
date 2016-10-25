(function () {
    'use strict';
    var $yaml = require('js-yaml');
    var $fs = require('fs');
    var $controller = require('./controller.js');
    var $bundle = require('./bundle.js');
    var $security = require('./security.js');
    var $service = require('./service.js');
    var $path = require("path");
    var compression = require('compression');
    var session = require('express-session');


    module.exports = Root;
    function Root($app, $server, $port, $host, $express) {

        $security($app, $express, $fs, $yaml, $path);
        var BUNDLES = [];
        var SERVICE = [];
        function add(path, racine) {
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
                            fn: controller[2],
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
        }




        var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../app", "./config.yml"), 'utf8'));



        if (!config.hasOwnProperty("framework")) {
            throw ('ERROR IN CONFIG FRAMEWORK')
        }
        var doc = config.framework;

        /*Compression*/
        if (doc.hasOwnProperty("compression_gzip")) {
            if (doc.compression_gzip === true) {
                $app.use(compression({threshold: 0, filter: function () {
                        return true;
                    }}))
            }
            ;
        }

        /*Session*/
        if (doc.hasOwnProperty("session")) {
            var sessionStore = new session.MemoryStore;
            $app.set('trust proxy', 1)
            $app.use(session({secret: doc.session, store: sessionStore, resave: true, saveUninitialized: true, cookie: {httpOnly: true, secure: true}}));
        }


        if (doc.hasOwnProperty("bundles")) {
            var all = Object.keys(doc.bundles).length;
            var cmp = 0;
            function load(){
                cmp++;
                console.log("load " + (all / cmp) * 100 + "%");
                if (cmp >= all) {

                    var doc = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../app", "./routing.yml"), 'utf8'));
                    for (var i in doc) {
                   
                        if (!doc[i].hasOwnProperty("resource") || !doc[i].hasOwnProperty("prefix")) {
                            throw "error";
                        }
                       
                        add($path.join(__dirname, "../src/", doc[i].resource), doc[i].prefix);
                    }

                    if (config.hasOwnProperty("services")) {
                        for (var i in config.services) {
                            SERVICE[i] = new $service(config.services[i], {
                                $port: $port,
                                $host: $host,
                                $bundles: BUNDLES,
                                $fs:$fs,
                                $path:$path,
                                $yaml:$yaml
                            }, $path);
                        }
                    };


                }

            }
            for (var i in doc.bundles) {
                doc.bundles[i].path = i.replace(new RegExp(":", 'g'), "/");
                doc.bundles[i].name = i;
                BUNDLES[i] = new $bundle(doc.bundles[i], SERVICE, $fs, $path, $app, $controller, load);
            }
        }
        ;




    }

})();

