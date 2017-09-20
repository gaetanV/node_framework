var Injectable = (() => {
    

    var PRIVATE: Array<Function> = [];
    var instance: number = 0;
    
    return class {
        
        instance:number;
                
        constructor(){
            Object.defineProperty(this, 'instance', {value: instance++, writable: false, enumerable: false, configurable: false});
            PRIVATE[this.instance] = {};
            
        }

        get(name:string) {
            return PRIVATE[this.instance][name];
        }

        add(
            name:string,
            func :Function
        ){
            
            name = name.toLowerCase().replace(/-([a-z])/g, function (m, w) {
                return w.toUpperCase();
            });

            PRIVATE[this.instance][name] = func;
        }

        getInjects() {
          
           return Object.assign({}, PRIVATE[this.instance]);
        }

    }

})();
