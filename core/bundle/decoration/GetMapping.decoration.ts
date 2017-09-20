function GetMapping(
    param: {
        path: string,
        requirements: string
    }
 ) {
    
    return function (a: Function, b: Function) { 
        BUNDLE.controllerMapping(a.constructor.name,"GET",a[b],param.path || "",param.requirements|| []);
    };
    
};


