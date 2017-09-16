function GetMapping() {
    
    return function (a: Function, b: Function) { 
        BUNDLE.controllerMapping(a.constructor.name,"GET",a[b]);
    };
    
};


