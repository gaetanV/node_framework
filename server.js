(function () {
    'use strict';
    const kernel= require('./core/kernel.js');
    new kernel(7200, '192.168.0.11');
    console.log( process.memoryUsage());
})();
