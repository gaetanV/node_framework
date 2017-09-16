var CORE = new _share.core({
    noInjectable : ['compression', 'express-session', 'body-parser', 'cookie-parser', 'ws', 'express' , 'http'],   
    injectable: ['fs',
                 'path',
                 'pug', 
                 'node-uuid', 
                 'monk', 
                 'Mustache', 
                 'js-yaml'],
    bootPath: {
        root_dir: "./app/",
        cache_dir: "./app/cache",
        web_dir: "./web/",
        bundle_dir: "./src/",
        logs_dir: "./app/logs",
    }
});

module.exports = CORE;
