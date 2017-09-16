function StreamMapping() {
    
    return function (a: Function, b: Function) {
        BUNDLE.controllerMapping(a.constructor.name,"STREAM",a[b]);
    };
};


