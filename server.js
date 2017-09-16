(function () {
    'use strict';
    const CORE = require('./dist/core.js');
    CORE.boot(7200, 'localhost',__dirname);
    console.log( process.memoryUsage());
})();
