@Component({
    selector: "bundle",
    provider: ["fs", "mustache", "pug", "path", "parameters"]
})
class {

    templating: string = "html";
    get: (name: string) => any;


  

    constructor(name:string,
                controller,
                engine:string,
                InjectorService
    ) {
    
        var fs: FsInterface = this.get("fs");
        var Mustache = this.get("mustache");
        var pug = this.get("pug");
        var $parameters = this.get("parameters");
        var $path = this.get("path");
        
        const enginer = ['pug', 'mustache', 'html'];
        
        // ENGINE
        
        if (enginer.includes(engine)) {
            this.templating = engine;
        } else {
            throw "THIS TEMPLATE ENGINER IS OUT OF DATE"
        }
        
        
        switch (this.templating) {
            case "html":
                this.parser = function (path, param) {
                    return vm.views[path];
                }
                break;
            case "jade":
            case "pug":
                this.parser = function (path, param) {
                    return pug.render(vm.views[path], param);
                }
                break;
            case "mustache":
                this.parser = function (path, param) {
                    return Mustache.render(vm.views[path], param);
                }
                break;
        }
        
        // VIEWS
        
        var path = name.replace(new RegExp(":", 'g'), "/");
        
        this.path = {
            root_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path),
            controller_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Controller"),
            view_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Ressources", "views"),
        }
        
        this.views = [];
        

        async function getRepView(path){
            return new Promise((resolve)=>{
                fs.readdir(path, function (err, files) {
                   resolve(files);
                }
            })
        }
        
        async function getRepertory(path){
            var result = [];
            var files = await getRepView(path);
            files.forEach(function (file) {
                result.push(fs.readFileSync($path.join(path, file), 'utf8'));
            });
            return result;
        }
        

        getRepertory(this.path.view_dir).then((a)=>{
            console.log(a);
        })
       
        
        /*
  
        this.name = name;
        //PARSE SERVICES//


        this.controllers = [];
        this.services = services;
        this.parser = false;



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
                        
                        // vm.controllers[controllerName[1]] = vm.component("controller")(
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
        
        */
    }
 

}