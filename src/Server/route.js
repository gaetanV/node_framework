(function () {
    'use strict';

    function Root(app) {
        var yaml = require('js-yaml');
        var fs = require('fs');
        return {
            add: function (path,racine) {
                var $bundles = [];
                try {
                    var doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
                    for (var i in doc) {
                        var route = doc[i];
                        var c = route.defaults._controller;
                        var controller = c.split(":");
                        // console.log(route.methods);
                        // console.log(route.requirements);
                        var bundleName = controller[0];
                        var controllerName = controller[1];
                        var route = {
                            fn: controller[2] + "Action",
                            path: route.path
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
                        var controller = require("./" + i + "/Controller/" + j + "Controller.js")(app);
                        for (var k in $bundles[i][j]) {
                            var route = $bundles[i][j][k];
                            if (typeof controller[route.fn] === "function") {
                                console.log("route : " + racine+route.path);
                                app.get(racine+route.path, controller[route.fn]);
                            }
                        }
                    }
                }
            }
        }
    }
    module.exports = Root;
})();

