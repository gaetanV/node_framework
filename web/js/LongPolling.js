var LongPolling
(function () {
    'use strict';
    
    
     LongPolling = function (ip) {
       function callNode() {
                $.ajax({
                    cache : false,
                            // setup the server address
                    url : 'http://192.168.0.11:8124/',
                    data : {},
                    success : function(response, code, xhr) {
                        if ('OK' == response) {
                            callNode();
                            return false;
                        }
                        callNode();
                    }
                });
            };
            callNode();
        }

})();