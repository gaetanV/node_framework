(function () {
    'use strict';
    module.exports = inject;
    function inject(inject,vm) {
        var vm=vm?vm:{};
        var inject=inject?inject:{};
        return  {
            apply: function (fn, params) {
                var args = this.getArguments(fn);
                var injectParam = [];
                 
                for (var i in args) {
                     
                    if(params){
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
            getInjects:function(){
                 return Object.assign({}, inject);
            },
            hasInject:function(namespace){
                return inject[namespace]?true:false;
            },
            addInject:function(namespace,fn){
                namespace="$"+namespace;
             
                if(!inject[namespace]){
                    inject[namespace]=fn;
                }
            },
            addThis:function(namespace,fn){
                  if(!vm[namespace]){
                    vm[namespace]=fn;
                }
            },
            getArguments:function(fn) {
                var chaine = fn.toString().replace(/\n|\r|(\n\r)/g, ' ').slice(0, 200);
                var re = /^function[\s]*([^\(]*)\(([^\)]*)\)[\s]*{/g;
                var match = re.exec(chaine);
                return match[2].replace(/ /g, '').split(",");
            }

        }
    }
})();