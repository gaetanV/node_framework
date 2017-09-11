@Component({
    selector: "Routing/route",
    provider: ["app"]
})
class{
    constructor(
        methods,
        requirements,
        fn,
        path,
        services,
        parser

    ) {
        function parseParams(reqParams) {
            var params = [];
            for (var key in requirements) {
                if (!reqParams.hasOwnProperty(key)) {
                    throw "error route param no match requirements " + key;
                }
                var m = new RegExp('^' + requirements[key] + '$', 'gi');
                if (!reqParams[key].match(m)) {
                    throw "error route param no match requirements " + key + " :: " + requirements[key];
                }
                params[key] = (reqParams[key]);
            }
            ;

            return params;
        }
        for (var i in methods) {
            var method = methods[i];
            switch (method) {
                case "GET":
                    this.get("app").get(path, function (req, res, next) {
                        try {
                            var params = parseParams(req.params);
                            fn.apply({

                                render: function (path, param) {
                                    try {

                                        res.end(parser(path, param));
                                    } catch (err) {
                                        console.log(err);
                                        return false;
                                    }
                                    ;
                                },
                                request: {
                                    get: function (key) {
                                        return req.params[key];
                                    }
                                },
                            }, params);
                            // res.status(401).send("GET");
                        } catch (err) {
                            console.log(err);
                            res.status(401).send("ERROR");
                        }
                    });
                    break;
                case "POST":
                    this.get("app").post(path, function (req, res, next) {
                        try {
                            var params = parseParams(req.params);
                            fn.apply({
                                get: function (namespace) {
                                    return services[namespace];
                                },
                                render: function (path, param) {
                                    try {
                                        res.end(parser(path, param));
                                    } catch (err) {
                                        console.log(err);
                                        return false;
                                    }
                                    ;
                                },
                                request: {
                                    get: function (key) {
                                        return req.params[key];
                                    }
                                },
                            }, params);


                            //res.status(401).send("POST");
                        } catch (err) {
                            console.log(err);
                            res.status(401).send("ERROR");
                        }
                    });
                    break;
            }
        }
    }

}
