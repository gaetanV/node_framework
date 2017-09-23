function PostMapping(
    param: {
        path: string,
        requirements: string
    }
 ) {
    
    return function (a: Function, b: Function) {
        
        BUNDLE.controllerMapping(a.constructor.name,"POST",a[b],param.path || "",param.requirements|| []);
        
    };
    
};


