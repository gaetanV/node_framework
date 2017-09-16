function PostMapping() {
    
    return function (a: Function, b: Function) {
        
        BUNDLE.controllerMapping(a.constructor.name,"POST",a[b]);
        
    };
    
};


