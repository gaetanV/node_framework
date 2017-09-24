@Component({
    selector: "bundle",
    provider: ["fs", "mustache", "pug", "path", "parameters"]
})
class {
    
    name: string;
    templating: string = "html";
    get: (name: string) => any;
    GET: Array<any> = [];
    STREAM: Array<any> = [];  
    
    async constructor(name:string,
                controller,
                prefix:string,
                engine:string,
                InjectorService
    ) {
      
        const enginer = ['pug', 'mustache', 'html'];
        const fs: FsInterface = this.get("fs");
        const mustache = this.get("mustache");
        const pug = this.get("pug");
        const $parameters = this.get("parameters");
        const $path = this.get("path");
       
        
        this.name = name;
        
        // ENGINE
        
        if (enginer.includes(engine)) {
            this.templating = engine;
        } else {
            throw "THIS TEMPLATE ENGINER IS OUT OF DATE"
        }
        
        
        switch (this.templating) {
            case "html":
                this.parser = function (path, param) {
                    return this.views[path];
                }
                break;
            case "jade":
            case "pug":
                this.parser = function (path, param) {
                    return pug.render(this.views[path], param);
                }
                break;
            case "mustache":
                this.parser = function (path, param) {
                    if(!this.views[path]) throw "view" + this.views[path] +"not found";
                    return mustache.render(this.views[path], param);
                }
                break;
        }
        
        // PATH
        
        var path = name.replace(new RegExp(":", 'g'), "/");
        
        this.path = {
            root_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path),
            controller_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Controller"),
            view_dir: $path.join($parameters.getParameter("kernel.bundle_dir"), path, "Ressources", "views"),
        }
        
        // CONTROLLER 
 
        for(var i in controller){
            
         
            var m = new RegExp('^(.*)Controller$', 'gi');
            if ! m.exec(i) throw "error in controller name";
            if ! controller[i].path throw "error in controller path";
            var rootPath = controller[i].path; 
            if(controller[i].hasOwnProperty("GET")){
                controller[i].GET.forEach((a)=>{
                    if(!a.path) throw "Path is undefined";
                    if(!a.func) throw "function is undefined";
                    a.func.get = (name:string) => {
                        return InjectorService.get(name);
                    }
                    a.path = $path.join(prefix,rootPath,a.path).replace(/\\/g, '/')
                    this.GET.push(a);

                })
            }
            if(controller[i].hasOwnProperty("STREAM")){
                controller[i].STREAM.forEach((a)=>{
                    if(!a.path) throw "Path is undefined";
                    if(!a.func) throw "function is undefined";
                    a.func.get = (name:string) => {
                        return InjectorService.get(name);
                    }
                    a.path = $path.join(prefix,rootPath,a.path).replace(/\\/g, '/')
                    this.STREAM.push(a);

                })
            }
            
        }
    

        // VIEWS
        
        
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
                result[file] = (fs.readFileSync($path.join(path, file), 'utf8'));
            });
            return result;
        }
        
        return new Promise((resolve) => {

           getRepertory(this.path.view_dir).then((a)=>{
               this.views = a;
               resolve(this);
           })
        }):
   
    }
 

}