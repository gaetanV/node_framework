(function () {
    'use strict';
    const CORE = require('./core/core.js');
    CORE.boot(7200, 'localhost');
    console.log( process.memoryUsage());
})();
