(function () {
    'use strict';

    var Bundle = function (name, params, services, callback, $path, $fs, $mustache, $pug) {

        const enginer = ['pug', 'mustache', 'html'];
        this.templating = "html";
        if (params.hasOwnProperty("templating")) {
            if (enginer.indexOf(params.templating) !== -1) {
                this.templating = params.templating;
            } else {
                throw "THIS TEMPLATE ENGINER IS OUT OF DATE"
            }
        }
        this.name = name;
        //PARSE SERVICES//

        var path = name.replace(new RegExp(":", 'g'), "/");
        this.path = {
            root_dir: $path.join(this.container.getParameter("kernel.bundle_dir"), path),
            controller_dir: $path.join(this.container.getParameter("kernel.bundle_dir"), path, "Controller"),
            view_dir: $path.join(this.container.getParameter("kernel.bundle_dir"), path, "Ressources", "views"),
        }


        this.views = [];
        $fs.statSync(this.path.view_dir);
        var vm = this;
        $fs.readdir(this.path.view_dir, function (err, files) {
            files.forEach(function (file) {
                var view = $fs.readFileSync($path.join(vm.path.view_dir, file), 'utf8');
                vm.views[file] = view;
            });
        });

        this.controllers = [];
        this.services = services;
        this.parser = false;

        switch (this.templating) {
            default:
                throw vm.templating + " templating is not in charge"
            case "html":
                this.parser = function (path, param) {
                    return vm.views[path];
                }
                break;
            case "jade":
            case "pug":
                var pug = $pug;
                this.parser = function (path, param) {
                    return pug.render(vm.views[path], param);
                }
                break;
            case "mustache":
                var Mustache = $mustache;
                this.parser = function (path, param) {
                    return  Mustache.render(vm.views[path], param);
                }
                break;
        }


        try {
            $fs.statSync(this.path.root_dir);
            $fs.statSync(this.path.controller_dir);
            $fs.statSync(this.path.view_dir);
        } catch (err) {
            throw "ERROR BUNDLE PATH IS FALSE"
        }
        try {
            var vm = this;
            var $controller = this.use("/Component/HttpKernel/controller");


            $fs.readdir(this.path.controller_dir, function (err, files) {
                var processed = 0;
                var nbTask = files.length;
                files.forEach(function (file) {

                    var m = new RegExp('^(.*)Controller.js$', 'gi');
                    var controllerName = m.exec(file);
                    if (controllerName) {
                        vm.controllers[controllerName[1]] = $controller.inject({services: vm.services, file: $fs.readFileSync($path.join(vm.path.controller_dir, file), 'utf8')});
                    }
                    processed++;
                    if (processed >= nbTask) {
                        callback();
                    }


                });
            });
        } catch (err) {
            throw err;
        }
        return this;


    }

    module.exports = Bundle;


})();