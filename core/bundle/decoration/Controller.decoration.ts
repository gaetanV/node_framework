function Controller(
    param: {
        path: string
    }
 ) {
         
    return function (a: Function) { 
        BUNDLE.controller(a.name, a,param.path || ""); 
    };
};


