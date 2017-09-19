require = false;

const BUNDLE = (function (): void {
  
    interface privateInterface {
        service: any,
        controller: any,
    }
    var isControllerLock = false;
    var PRIVATE: privateInterface =  {
        service : {} ,
        controller : {},
    };

    
    class Bundle {

        instance:number;
        
        debug(){
            return PRIVATE;
        }
        
        constructor() {}

        getController(){
            return Object.assign({}, PRIVATE.controller);
        }

        controller(
            Name: string,
            func
        ) {
            if(! PRIVATE.controller[Name]) PRIVATE.controller[Name] = {};
            
            if(PRIVATE.controller[Name].func || isControllerLock) throw "DON'T TRY TO HACK";
            
            PRIVATE.controller[Name].func = func;

        }
      
        lockController (){
            isControllerLock = true;   
        }
        
        
        controllerMapping(
            controllerName: string,
            methode,
            func
        ) {
            if(! PRIVATE.controller[controllerName]) PRIVATE.controller[controllerName] = {};
            if(! PRIVATE.controller[controllerName][methode]) PRIVATE.controller[controllerName][methode] = {};
            
            if(PRIVATE.controller[controllerName][methode][func.name] || isControllerLock) throw "DON'T TRY TO HACK";
            
            PRIVATE.controller[controllerName][methode][func.name]= func;
                    
     

            
        }
        
    
        

    }
    return new Bundle();
     
})();
