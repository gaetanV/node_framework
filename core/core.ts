declare var require: any;


interface namespaceInterface {
     service: (Name: string) => void;
     controller: (Name: string) => void;
}

interface _shareInterface {
    core:any;
}


var _share: _shareInterface = {
    "core" : () => {}
};



(function (_share:_shareInterface) :void {
    'use strict';

    var noInjectable:  Map<string,any> = {};
    var injectable:  Map<string,any> = {};

    function autoload(path, injection, $fs, $path) {
        return function (namespace) {
            function parse(path) {
                eval($fs.readFileSync(path, 'utf8'));
                return module.exports;
            }
            var fn = parse($path.join(path, namespace + ".js"));
            fn.inject = function (args) {
                return  injection.apply(fn, args);
            }
            return  fn;
        }
    }

    function inject(inject, vm) {
        var vm = vm ? vm : {};
        var inject = inject ? inject : {};
        return  {
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

                return  fn.apply(vm, injectParam);
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
        constructor(){};
        
        declareModule( Name:string ) :boolean {
            return true;
        }

        module( Name:string ) : namespaceInterface {

            return {

                "service":  function (Name:string):void  {


                },
                "controller": function (Name:string):void {


                }
            };
        }
        
    }
    class core extends moduleStrategy{

        bootPath:string;

        constructor( Param:{
                noInjectable: Array<string>;
                injectable: Array<string>;
                bootPath: string
        }){
            super();
            Param.injectable.forEach((v)=>{
               injectable[v] = require(v);
            });
            
            Param.noInjectable.forEach((v)=>{
               noInjectable[v] = require(v);
            });
            
            this.bootPath = Param.bootPath;
         
        }
        
        boot (Port: number, Host: string):void {
            
             new kernel(Port, Host, noInjectable, injectable, inject,autoload);
        }
    }
    _share.core = core;
    
})(_share);