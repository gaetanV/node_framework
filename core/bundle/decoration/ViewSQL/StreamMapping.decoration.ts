function StreamMapping(
    param: {
        path: string,
        requirements: string,
        persitence:any
    }
 ) {   
    return function (a: Function, b: Function) {
        BUNDLE.controllerMapping(a.constructor.name,"STREAM",a[b],param.path || "",param.requirements || "", param.persitence || []);
    };
};


