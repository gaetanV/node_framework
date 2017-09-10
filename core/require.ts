
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
               noInjectable[v] = require(v);
            });
            
            Param.noInjectable.forEach((v)=>{
               noInjectable[v] = require(v);
            });
            
            this.bootPath = Param.bootPath;
         
        }
        
        boot (Port: number, Host: string):void {
             new kernel(Port, Host, noInjectable, injectable);
        }
    }
    _share.core = core;
    
})(_share);

 

var CORE = new _share.core({
    bootPath: './kerel.js',
    noInjectable : [ 'compression', 'express-session', 'body-parser', 'cookie-parser'],   
    injectable: ['fs', 'path', 'http', 'express', 'pug', 'node-uuid', 'monk', 'Mustache', 'ws','js-yaml']
});

module.exports = CORE;
