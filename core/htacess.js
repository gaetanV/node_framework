(function () {
    'use strict';

    module.exports = Htacess;
    function Htacess(app, express, $fs, $yaml, $path) {
        var RESTRICT = [];
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
        publicArea("/", "./web/");

        function publicArea(redirect, staticpath) {
            var index = "" + INDEX;
            var restricts = RESTRICT.slice(0);
            // var path=PATH.join(__dirname,'../',staticpath,'htacess.yml');
            /*
             ..... TOO SLOW TRY TO DO BY REPERTORY......
             if (fs.existsSync(path)) {
             var doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
             if(doc.hasOwnProperty("restrict")){
             for(var i in doc.restrict){
             restricts.push(redirect+doc.restrict[i]);
             }
             }
             if(doc.hasOwnProperty("index")){
             index= doc.index;
             }
             }*/

            function restrict(req, res, next) {


                /*   res.writeHead(302, {
                 'Location': '/home.html'
                 
                 });
                 res.end();*/
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
                    res.status(404).send(err);
                    return false;
                }
                ;
            }

            app.use(redirect, restrict, express.static(staticpath, {index: index}));

        }
        ;



    }
    ;

})();