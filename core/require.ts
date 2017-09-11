var CORE = new _share.core({
    noInjectable : [ 'compression', 'express-session', 'body-parser', 'cookie-parser'],   
    injectable: ['fs', 'path', 'http', 'express', 'pug', 'node-uuid', 'monk', 'Mustache', 'ws','js-yaml']
});
module.exports = CORE;
