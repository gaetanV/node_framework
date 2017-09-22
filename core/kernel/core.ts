interface _shareInterface {
    core: any;
}

var _share: _shareInterface = {
    "core": () => {},
};

(function (_share: _shareInterface, _Injectable): void {
    'use strict';
    
    var Bundles = [];


    var Injectable = new _Injectable();
    var component: Map<string, any> = {};
    
    var ServiceComponent: Map<string, any> = {};
    var ServiceInjectable = new _Injectable();
    var service: Map<string, any> = {};


    var noInjectable: Map<string, any> = {};
    var injectable: Map<string, any> = {};

    var lockComponent = 0;
    var lockService = false;

    class moduleStrategy {
        constructor() {};

        lockComponent() {
            lockComponent++; 
        }
        
        lockService(){
            lockService = true;
        }

        component(
            Name: string,
            injector,
            func
        ) {
       
            switch(lockComponent){
                case 0:
                    if (component[Name]) throw "don't try to hack"
                    component[Name] = {
                       inject: function (...args) {

                           func.prototype.get = function (name) {
                               return injector.includes(name) ? Injectable.get(name) : false;
                           }

                           func.prototype.component = function (id) {
                               return component[id].inject;
                           }

                           return new func(...args);

                       })
                   }
                   break;
                case 1:
             
                    if (ServiceComponent[Name]) throw "don't try to hack"
                    
                    ServiceComponent[Name] = {
                         inject: function (...args) {
                            func.prototype.get = function (name) {
                                return injector.includes(name) ? ServiceInjectable.get(name) : false;
                            }

                            func.prototype.component = function (id) {
                                return ServiceComponent[id].inject;
                                
                            }

                            return new func(...args);
                         }
                    }
                    
                        
                    break;
                   
                default:
                    throw "don't try to hack"
   
            }

        }
        
        service(
            Name: string,
            injector,
            params,
            func
        ) {
        
            var ParamsService = [];
            var InjectorServiceClass =  new _Injectable();
            
            if (!service[Name] && !lockService) {
                service[Name] = {
                    params: function(Params){
                        for(var i in Params){
                            if(!params.includes(i)){
                                throw "params " + i + " not match service " + Name;
                            }
                        }
                        ParamsService = Params;
                    },
                    inject: function(){
                        var tmpInjectorService = new _Injectable();
                        for (var i in injector) {
                            tmpInjectorService.transclude(ServiceInjectable,injector[i]);
                        }
                        InjectorServiceClass = tmpInjectorService;
                    },          
                    class: function (...args) {
                        
                        func.prototype.get = function (name) {
                            return InjectorServiceClass.get(name);
                        }

                        func.prototype.component = function (id) {
                           return ServiceComponent[id].inject;
                        }
                        
                        func.prototype.params = function (id) {
                            return ParamsService[id];
                        }

                        return new func(...args);

                    })
                }
            }else{
                throw "Don't try to HACK";
            }

        }

    }


    var componentInjection = function (name: string) {
        if (component[name]) {
            return component[name].inject;
        }
    }

    class core extends moduleStrategy {

        bootPath: Map<string, string>;

        constructor(Param: {
            noInjectable: Array<string>;
            injectable: Array<string>;
            bootPath: Map<string, string>
        }) {
            super();


            Param.injectable.forEach((v) => {
                noInjectable[v] = require(v);
                Injectable.add(v, require(v));
            });

            Param.noInjectable.forEach((v) => {
                noInjectable[v] = require(v);
            });
            
            var config = Injectable.get("jsYaml").safeLoad(Injectable.get("fs").readFileSync("./app/config.yml", 'utf8'));
            for(var i in config.framework.bundles){
                
                Bundles[i] = {
                    name: i,
                    injector: require("./"+i+".js"),
                    prefix: config.framework.bundles[i].prefix || "/"
                    templating: config.framework.bundles[i].templating || "html"
                }
               
            }
            
            this.bootPath = Param.bootPath;

        }

        boot(Port: number, Host: string, Root: string): void {

            for (var i in this.bootPath) {
                this.bootPath[i] = Injectable.get("path").join(Root, this.bootPath[i]);
            }

            var parameters = componentInjection("parameters")();
            parameters.setParameter("kernel", this.bootPath, true);
            Injectable.add("parameters", parameters);
         
            var _kernel = new kernel(noInjectable, componentInjection, Injectable);
            var $app = _kernel.startServer(Port, Host);

            var $event = componentInjection("event")();
            
            ServiceInjectable.add("event", $event);
            ServiceInjectable.add("cache", componentInjection("cache")());
            ServiceInjectable.add("$event", $event);
            ServiceInjectable.add("$bundles", Bundles);
            ServiceInjectable.add("ws", noInjectable["ws"]);
            ServiceInjectable.add("$app", $app);
            ServiceInjectable.concat(Injectable);
           
            var InjectorService = _kernel.startService( ServiceInjectable , service ,_Injectable);
                
            for(var i in Bundles){
                _kernel.startBundle(Bundles[i].name,
                                    Bundles[i].injector.getController(), 
                                    Bundles[i].prefix,
                                    Bundles[i].templating,
                                    InjectorService,
                                    $app);
            }

        }
    }
    _share.core = core;

})(_share, Injectable);