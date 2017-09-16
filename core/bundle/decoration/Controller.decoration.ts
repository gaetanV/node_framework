function Controller() {
         
    return function (a: Function) { 
        BUNDLE.controller(a.name, a); 
    };
};


