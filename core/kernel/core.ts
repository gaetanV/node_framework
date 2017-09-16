interface _shareInterface {
    core: any;
}

var _share: _shareInterface = {
    "core": () => {},
};

(function (_share: _shareInterface, _Injectable): void {
    'use strict';

    var Injectable = new _Injectable();
    var component: Map<string, any> = {};
    
    var ServiceInjectable = new _Injectable();
    var service: Map<string, any> = {};


    var noInjectable: Map<string, any> = {};
    var injectable: Map<string, any> = {};

    var lockComponent = false;
    var lockService = false;
    
    function autoload(path, injection, $fs: FsInterface, $path) {
        return function (namespace) {
            function parse(path) {
                eval($fs.readFileSync(path, 'utf8'));
                return module.exports;
            }
            var fn = parse($path.join(path, namespace + ".js"));
            fn.inject = function (args) {
                return injection.apply(fn, args);
            }
            return fn;
        }
    }

    function inject(inject, vm) {
        var vm = vm ? vm : {};
        var inject = inject ? inject : {};
        return {
            apply: function (fn, params) {
                var args = this.getArguments(fn);
                var injectParam = [];

                for (var i in args) {

                    if (params) {
                        if (params[args[i]]) {

                            injectParam[i] = params[args[i]];

                        }
                    }

                    if (inject[args[i]]) {
                        injectParam[i] = inject[args[i]];
                    }

                }

                return fn.apply(vm, injectParam);
            },
            getInjects: function () {
                return Object.assign({}, inject);
            },
            hasInject: function (namespace) {
                return inject[namespace] ? true : false;
            },
            addInject: function (namespace, fn) {
                namespace = "$" + namespace;

                if (!inject[namespace]) {
                    inject[namespace] = fn;
                }
            },
            addThis: function (namespace, fn) {
                if (!vm[namespace]) {
                    vm[namespace] = fn;
                }
            },
            getArguments: function (fn) {
                var chaine = fn.toString().replace(/\n|\r|(\n\r)/g, ' ').slice(0, 200);
                var re = /^function[\s]*([^\(]*)\(([^\)]*)\)[\s]*{/g;
                var match = re.exec(chaine);
                return match[2].replace(/ /g, '').split(",");
            }

        }
    }

    class moduleStrategy {
        constructor() {};

        declareModule(Name: string): boolean {
            return true;
        }

        lockComponent() {
            lockComponent = true;
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
                    inject: function(Injector){
                        InjectorServiceClass = Injector;
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

            this.bootPath = Param.bootPath;

        }

        boot(Port: number, Host: string, Root: string): void {

            for (var i in this.bootPath) {
                this.bootPath[i] = Injectable.get("path").join(Root, this.bootPath[i]);
            }

            var parameters = componentInjection("parameters")();
            parameters.setParameter("kernel", this.bootPath, true);
            Injectable.add("parameters", parameters);
            Injectable.add("inject", inject);
            var _kernel = new kernel(noInjectable, componentInjection, Injectable);
            var $app = _kernel.startServer(Port, Host);
            Injectable.add('app', $app);


            var injection = inject();
            var $event = componentInjection("event")();
            
            ServiceInjectable.add("event", $event);
            ServiceInjectable.add("cache", componentInjection("cache")());
            ServiceInjectable.add("$event", $event);
            ServiceInjectable.add("ws", noInjectable["ws"]);
            
            for (var i in Injectable.collection) {
                ServiceInjectable.add(i,Injectable.collection[i]);
            }
            
            var services = {
                event: $event,
            }
            _kernel.startService( ServiceInjectable, services , service,_Injectable);
            
           // var bundles = _kernel.startBundle(injection, services);
            
            

            

        }
    }
    _share.core = core;

})(_share, Injectable);