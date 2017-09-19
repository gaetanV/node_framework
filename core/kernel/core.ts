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
    
    var ServiceInjectable = new _Injectable();
    var service: Map<string, any> = {};


    var noInjectable: Map<string, any> = {};
    var injectable: Map<string, any> = {};

    var lockComponent = false;
    var lockService = false;

    class moduleStrategy {
        constructor() {};

        lockComponent() {
            lockComponent = true;
        }
        
        lockService(){
            lockService = true;
        }

        component(
            Name: string,
            injector,
            func
        ) {
            if (!component[Name] && !lockComponent) {
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
            }else{
                throw "Don't try to HACK";
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
                            if(ServiceInjectable.get(injector[i])){
                                tmpInjectorService.add(injector[i],ServiceInjectable.get(injector[i]));
                            }
                        }
                        InjectorServiceClass = tmpInjectorService;
                    },          
                    class: function (...args) {
                        
                        func.prototype.get = function (name) {
                            return InjectorServiceClass.get(name);
                        }

                        func.prototype.component = function (id) {
                            return component[id].inject;
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
                    templating: config.framework.bundles[i].templating || "html";
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
            Injectable.add('app', $app);

            var $event = componentInjection("event")();
            
            ServiceInjectable.add("event", $event);
            ServiceInjectable.add("cache", componentInjection("cache")());
            ServiceInjectable.add("$event", $event);
            ServiceInjectable.add("ws", noInjectable["ws"]);
            ServiceInjectable.add("$bundles", Bundles);
            var tmp = Injectable.getInjects()
            for (var i in tmp) {
                ServiceInjectable.add(i,tmp[i]);
            }
            
        
               
            var InjectorService = _kernel.startService( ServiceInjectable , service ,_Injectable);
                
            for(var i in Bundles){
                _kernel.startBundle(Bundles[i].name,
                                    Bundles[i].injector.getController(), 
                                    Bundles[i].templating,
                                    InjectorService);
            }
            //  _kernel.startBundle([],ServiceInjectable).then((bundles)=>{ console.log(bundles); });

        }
    }
    _share.core = core;

})(_share, Injectable);