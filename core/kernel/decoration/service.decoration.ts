function Service(param: {selector: string, provider: Array<string> , params: Map<string,any>}) {

    if (!param.selector) {
        throw "you need a selector";
    }
    
    return function (a: Function) {
        CORE.service(param.selector, param.provider || [], param.params || [],  a);
    };

};
