function Component(param: {selector:string, provider: Array<string>}) {

    if (!param.selector) {
        throw "you need a selector";
    } 
    return function (a: Function) {
        CORE.component(param.selector, a ,param.provider ? param.provider : [] );
    };
    
}
