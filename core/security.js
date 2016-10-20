(function () {
    'use strict';

    module.exports = Security;
    function Security(app, express, $fs, $yaml, $path) {
    
        var ACCESS_CONTROL = [] ,INDEX ;
        var doc = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../app", "./config.yml"), 'utf8'));
        if (!doc.hasOwnProperty("security")) {throw ('ERROR IN CONFIG SECURITY')}
        var doc = doc.security;
        
        if (!doc.hasOwnProperty("index")) {throw ('ERROR IN CONFIG INDEX') } 
        INDEX = doc.index;
        
        if (doc.hasOwnProperty("access_control")) {
            for (var i in doc.access_control) {
                if (!doc.access_control[i].hasOwnProperty("path") || !doc.access_control[i].hasOwnProperty("roles")) {
                    throw ('ERROR IN CONFIG access_control')
                }
                ACCESS_CONTROL.push(doc.access_control[i]);
            }
        }

        function getTimeMSFloat() {
            var hrtime = process.hrtime();
            return (hrtime[0] * 1000000 + hrtime[1] / 1000) / 1000;
        }

        publicArea("/", "./web/");
        function publicArea(redirect, staticpath) {
            function security(req, res, next) {
                 
                
                    
                    
                    
                var temp = getTimeMSFloat();
                try {
                 
                    
                    var access_control = ACCESS_CONTROL.slice(0);
                    for (var i in access_control) {
                    
                        var m = new RegExp('^' + access_control[i].path + '$', 'gi');
                        if (req.path.match(m)) {
                            if (access_control[i].roles === "IS_AUTHENTICATED_ANONYMOUSLY") {
                               
                                
                                 if(access_control[i].hasOwnProperty("whiteip")){
                                        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress ||  req.connection.socket.remoteAddress;
                                        var ip=ip.split(":").pop();
                                     
                                        var inlist=false;
                                        for (var j in access_control[i].whiteip) {
                                            if(access_control[i].whiteip[j]===ip){
                                                inlist=true;
                                            }
                                        }
                                        if(!inlist){
                                             throw "not allow your are not in white list" ;
                                        }

                                }
                                
                                console.log(getTimeMSFloat() - temp);
                                next();
                                return false;
                            } else {
                                throw "not allow" + access_control[i].roles;
                            }
                        }
                    }
                    throw "not allow";
                } catch (err) {
                    console.log(getTimeMSFloat() - temp);
                    res.status(401).send(err);
                    return false;
                }
            }
            var oneYear = 1 * 365 * 24 * 60 * 60 * 1000;
            app.use(redirect, security, express.static(staticpath, {maxAge: oneYear,index: INDEX}));
        }
        ;

    }
    ;

})();