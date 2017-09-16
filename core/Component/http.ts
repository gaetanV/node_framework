@Component({
    selector: "http",
    provider: ['inject']  
})
class {
    get:(name:string)=> any;
    
    constructor(vm, fn){
       
        var args = this.get('inject')().getArguments(fn);
        var vm = vm ? vm : {};
        return  {
            apply: function (vmInject, params) {

                for (var i in vmInject) {
                    vm[i] = vmInject[i];
                }
                var injectParam = [];
                for (var i in args) {

                    if (params) {
                        if (params[args[i]]) {

                            injectParam[i] = params[args[i]];

                        }
                    }

                }

                return  fn.apply(vm, injectParam);
            }
        }
        
        
    }

}