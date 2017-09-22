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
        
        concat(Injectable:Injectable){
            var tmp =Injectable.getInjects();
            for(var i in tmp){
                if(PRIVATE[this.instance][i]) throw "don't try to hack";
                PRIVATE[this.instance][i] = tmp[i];
            } 
        }
        
        transclude(Injectable:Injectable,name){
            if(!Injectable.get(name)) {
                console.log(name);
                throw "don't try to hack";
            }
            PRIVATE[this.instance][name] = Injectable.get(name);
            
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
