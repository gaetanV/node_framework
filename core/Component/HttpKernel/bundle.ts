@Component({
    selector: "HttpKernel/bundle",
    provider: ["fs", "mustache", "pug", "path","parameters"]
})
class {
    templating: string;

    constructor(
        name,
        parameter,
        services,
        callback
    ) {

        const enginer = ['pug', 'mustache', 'html'];

        var $path = this.get("path");
        var $fs = this.get("fs");
        var $mustache = this.get("mustache");
        var $pug = this.get("pug");
        var $parameters = this.get("parameters");
        
        this.templating = "html";

        if (parameter.hasOwnProperty("templating")) {
            if (enginer.indexOf(parameter.templating) !== -1) {
                this.templating = parameter.templating;
            } else {
                throw "THIS TEMPLATE ENGINER IS OUT OF DATE"
            }
        }
        this.name = name;
        //PARSE SERVICES//
     
        var path = name.replace(new RegExp(":", 'g'), "/");
        this.path = {
            root_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path),
            controller_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Controller"),
            view_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Ressources", "views"),
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
                    return Mustache.render(vm.views[path], param);
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


            $fs.readdir(this.path.controller_dir, function (err, files) {
                var processed = 0;
                var nbTask = files.length;

                files.forEach(function (file) {

                    var m = new RegExp('^(.*)Controller.js$', 'gi');

                    var controllerName = m.exec(file);

                    if (controllerName) {

                        var data = $fs.readFileSync($path.join(vm.path.controller_dir, file), 'utf8');

                        vm.controllers[controllerName[1]] = vm.component("HttpKernel/controller")(
                            data,
                            vm.services
                        );

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


    }



}