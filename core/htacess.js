(function () {
    'use strict';

    module.exports = Htacess;
    function Htacess(app, express, $fs, $yaml, $path) {
        var RESTRICT = [];
        var ACCESS_CONTROL = [];


        var doc = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../app", "./config.yml"), 'utf8'));
        if (doc.hasOwnProperty("index")) {
            var INDEX = doc.index;
        } else {
            throw ('ERROR IN CONFIG INDEX')
        }

        if (doc.hasOwnProperty("restrict")) {
            for (var i in doc.restrict) {
                RESTRICT.push(doc.restrict[i]);

            }
        }
        ;

        if (doc.hasOwnProperty("access_control")) {
            for (var i in doc.access_control) {
                if (!doc.access_control[i].hasOwnProperty("path") || !doc.access_control[i].hasOwnProperty("roles")) {
                    throw ('ERROR IN CONFIG access_control')
                }


                ACCESS_CONTROL.push(doc.access_control[i]);
            }

        }
        publicArea("/", "./web/");
        function publicArea(redirect, staticpath) {
            var index = "" + INDEX;
            var restricts = RESTRICT.slice(0);
            var access_control = ACCESS_CONTROL.slice(0);
            function restrict(req, res, next) {
                try {
                    for (var i in restricts) {
                        var m = new RegExp('^' + restricts[i] + '$', 'gi');
                        if (req.path.match(m)) {
                            throw "not allow";
                        }
                    }

                    next();
                } catch (err) {
                    res.status(401).send(err);
                    return false;
                }
                ;
            }
            function access(req, res, next) {
                function getTimeMSFloat() {
                    var hrtime = process.hrtime();
                    return (hrtime[0] * 1000000 + hrtime[1] / 1000) / 1000;
                }
                var temp = getTimeMSFloat();
                try {
                    for (var i in access_control) {
                        var m = new RegExp('^' + access_control[i].path + '$', 'gi');
                        if (req.path.match(m)) {
                            if (access_control[i].roles === "IS_AUTHENTICATED_ANONYMOUSLY") {
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
            app.use(redirect, restrict, access, express.static(staticpath, {index: index}));
        }
        ;

    }
    ;

})();