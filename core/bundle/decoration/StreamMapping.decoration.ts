function StreamMapping(
    param: {
        path: string,
        requirements: string
    }
 ) {   
    return function (a: Function, b: Function) {
        BUNDLE.controllerMapping(a.constructor.name,"STREAM",a[b],param.path || "",param.requirements || "");
    };
};


