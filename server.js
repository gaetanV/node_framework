(function () {
    'use strict';
    const CORE = require('./dist/core.js');
    CORE.boot(7200, '0.0.0.0',__dirname);
    console.log( process.memoryUsage());
})();
