function stream(){
        var STREAM=[];
        
        var setStream = function (route) {
            route.param = [];
            if (route.path.match(/{([^{}]*)}/g)) {
                var t = route.path.replace(/{([^{}]*)}/g,
                        function (match) {

                            var c = match.slice(1, -1);
                            route.param.push(c);
                            if (route.requirements.hasOwnProperty(c)) {
                                var r = route.requirements.id;
                                return "([" + r + "^/])";
                            }
                            return "([.^/]{1,})"
                        }
                );
            } else {
                var t = route.path;
            }
            route.regex = new RegExp('^' + t + '$', 'gi');
            STREAM.push(route);
        }


        var getStream = function (path, option) {
            for (var i in  STREAM) {
                if (path.match(STREAM[i].regex)) {
                    var r = {};
                    var t = STREAM[i].regex.exec(path);

                    for (var j = 0; j < STREAM[i].param.length; j++) {
                        r[STREAM[i].param[j]] = t[j + 1];
                    }
                    ;
                    return STREAM[i].getSpace(r, {}, path);
                }
            }
            return false;
        }
        return {
            setStream:setStream,
            getStream:getStream,
        }
};   
        
        
module.exports = stream;