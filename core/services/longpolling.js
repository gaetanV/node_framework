(function () {
    'use strict';
    module.exports = LongPolling;
    function LongPolling($http, $fs) {
        var http = $http;
        var fs = $fs;


        http.createServer(function (request, response) {
            response.phase = 0;
            console.log("phase");
            checkUpdate(request, response);
        }).listen(8124);
        function checkUpdate(request, response)
        {
            try {
                response.phase++;
                if (response.phase > 5) {
                    response.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': '*'
                    });

 
                    response.write('OK', 'utf8');
                    response.end();
                } else {
                    setTimeout(function () {
                        checkFile(request, response)
                    }, 1000);
                }
            } catch (err) {
                console.log(err);
            }

        }


    }
})();