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
            func,
            path
        ) {
            if(! PRIVATE.controller[Name]) PRIVATE.controller[Name] = {};
            
            if(PRIVATE.controller[Name].func || isControllerLock) throw "DON'T TRY TO HACK";
            
            PRIVATE.controller[Name].func = func;
            PRIVATE.controller[Name].path = path;
        }
      
        lockController (){
            isControllerLock = true;   
        }
        
        
        controllerMapping(
            controllerName: string,
            methode,
            func,
            path,
            requirements
        ) {
            if(! PRIVATE.controller[controllerName]) PRIVATE.controller[controllerName] = {};
            if(! PRIVATE.controller[controllerName][methode]) PRIVATE.controller[controllerName][methode] = [];

            PRIVATE.controller[controllerName][methode].push({
                func: func,
                name: func.name,
                path: path,
                requirements:requirements,
            });
                    

        }
 

    }
    return new Bundle();
     
})();
