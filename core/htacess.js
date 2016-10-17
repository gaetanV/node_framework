(function () {
    'use strict';

    module.exports = Htacess;
    function Htacess(app, express, $fs, $yaml, $path) {
        var RESTRICT = [];
        var ACCESS_CONTROL = [];
        var ACCESS = [[]];

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
                var dir = doc.access_control[i].path.slice(1).split('/');
                if (dir.length == 1) {
                    ACCESS[0].push({path: dir[0], roles: doc.access_control[i].roles});
                } else {



                    if (!ACCESS[dir.length - 1]) {
                        ACCESS[dir.length - 1] = [];
                    }
                    if (!ACCESS[dir.length - 1][dir[dir.length - 2]]) {
                        ACCESS[dir.length - 1][dir[dir.length - 2]] = [];
                    }
                    if (!ACCESS[dir.length - 1][dir[dir.length - 2]][dir[dir.length - 1]]) {
                        ACCESS[dir.length - 1][dir[dir.length - 2]][dir[dir.length - 1]] = [];
                    }


                    ACCESS[dir.length - 1][dir[dir.length - 2]][dir[dir.length - 1]] = [{path: doc.access_control[i].path, roles: doc.access_control[i].roles}];
                }
                ACCESS_CONTROL.push(doc.access_control[i]);
            }
            for (var i in doc.access_control) {

                var dir = doc.access_control[i].path.slice(1).split('/');
                for (var i = 0; i < dir.length; i++) {
                    if (ACCESS[i]) {
                        if (ACCESS[i][dir[i - 1]]) {
                            ACCESS[dir.length - 1][dir[dir.length - 2]][dir[dir.length - 1]].unshift({path: doc.access_control[i].path, roles: doc.access_control[i].roles});
                        }
                    }
                }
            }
        }
        console.log(ACCESS);



        publicArea("/", "./web/");

        function publicArea(redirect, staticpath) {
            var index = "" + INDEX;
            var restricts = RESTRICT.slice(0);
            var access_control = ACCESS_CONTROL.slice(0);
            var access_c = ACCESS.slice(0);
            function restrict(req, res, next) {
                console.log(req.path);
                console.log("------------------------------------------------------");
                try {
                    for (var i in restricts) {
                        var m = new RegExp('^' + restricts[i] + '$', 'gi');
                        console.log(m);
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

                var path=req.path;
               // var split=req.path.slice(1).split('/');
              //  var index=split[split.length - 2];
                try {
                    
                    //var access_control = access_c[split.length - 1];
                    for (var i in access_control) {
                        var m = new RegExp('^' + access_control[i].path + '$', 'gi');
                        if (path.match(m)) {
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
                    console.log("*********************");
                    console.log(getTimeMSFloat() - temp);
                    res.status(401).send(err);
                    return false;
                }
                ;



            }

            app.use(redirect, restrict, access, express.static(staticpath, {index: index}));

        }
        ;



    }
    ;

})();