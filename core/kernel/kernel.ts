class kernel {

    parameters: any;
    namespace: string = __dirname;
    maxAge: number = 1 * 365 * 24 * 60 * 60 * 1000;
    Injectable: InjectableInterface;

    Injectable: Injectable;
    services: Map<string, any>
    component: (string) => Function;

    startServer(
        Port: number,
        Host: string,
    ): EpxressInterface {

        var config = this.Injectable.get("jsYaml").safeLoad(this.Injectable.get("fs").readFileSync(this.parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
        if (!config.hasOwnProperty("framework")) throw ('ERROR IN CONFIG FRAMEWORK');
        if (!config.hasOwnProperty("security")) throw ('ERROR IN CONFIG SECURITY');
        if (!config.security.hasOwnProperty("index")) throw ('ERROR IN CONFIG SECURITY INDEX');

        var express: EpxressInterface = this.noInjectable["express"]();
        var server: HttpServeurInterface = this.noInjectable["http"].createServer(express);
        server.listen(Port, Host);

        this.parameters.setParameter("server",
            {
                root_dir: this.noInjectable["path"].join(__dirname, ".."),
                host: Host,
                port: Port,
            }, true
        );

        /* HTTP */
        express.use(
            this.noInjectable["body-parser"].json(),
            this.noInjectable["body-parser"].urlencoded({extended: true}),
            this.noInjectable["cookie-parser"]()
        );

        var framework = config.framework;
        if (framework.hasOwnProperty("compression_gzip")) {
            if (framework.compression_gzip === true) {
                express.use(this.noInjectable["compression"]({
                    threshold: 0, filter: function () {
                        return true;
                    }
                }))
            }
        }

        /* SESSION */
        express.set('trust proxy', 1)

        express.use(this.noInjectable['express-session']({
            secret: this.noInjectable["node-uuid"].v4(),
            name: 'session',
            id: this.noInjectable["node-uuid"].v4(),
            store: new this.noInjectable['express-session'].MemoryStore,
            resave: true,
            saveUninitialized: true,
            cookie: {httpOnly: true}
        }));


        /* SECURITY */
        var security = config.security;

        var $security = this.getSecurity(
            security.hasOwnProperty("access_control") ? security.access_control : [],
            security.hasOwnProperty("auth") ? security.auth : [],
        );

        express.use(
            "/",
            $security.firewall,
            $security.auth,
            this.noInjectable["express"].static(this.parameters.getParameter("kernel.web_dir"), {
                maxAge: this.maxAge,
                index: security.index
            })
        );

        return express;
    }



    startBundle(
        name:string,
        controller,
        prefix: string,
        engine:string,
        InjectorService,
        app) {
        
        
        function parseParams(reqParams,requirements) {
            var params = [];
            for (var key in requirements) {
                if (!reqParams.hasOwnProperty(key)) {
                    throw "error route param no match requirements " + key;
                }
                console.log(requirements[key]);
                var m = new RegExp('^' + requirements[key] + '$', 'gi');
                if (!reqParams[key].match(m)) {
                    throw "error route param no match requirements " + key + " :: " + requirements[key];
                }
                params[key] = (reqParams[key]);
            }

            return params;
        }
        
        
        this.component("bundle")( name, controller, prefix , engine, InjectorService).then((bundle)=>{
            
            bundle.GET.forEach((action)=>{
                console.log("[GET] "+action.path);
                try{
                    app.get(action.path, function (req, res, next) {
                          var params = parseParams(req.params,action.requirements);
                          action.func.apply({
                                render: function (path, param) {
                                    try {
                                        res.end(bundle.parser(path, param));
                                    } catch (err) {
                                        console.log(err);
                                        return false;
                                    }
                                },
                                request: {
                                    get: function (key) {
                                        return req.params[key];
                                    }
                                },
                          }, params);
                     });
                } catch (err) {
                    console.log(err);
                    res.status(401).send("ERROR");
                }
             })
             
        });
 
    }

    startService(Injectable, serviceInjection, _Injectable) {


        var config = this.Injectable.get("jsYaml").safeLoad(this.Injectable.get("fs").readFileSync(this.parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
        var config_services = config.hasOwnProperty("services") ? config.services : [];

        var InjectorService = new _Injectable();
        for (var i in config_services) {
            var service = config_services[i];


            if (service.hasOwnProperty("params")) {
                serviceInjection[i].params(service.params);
            }

            serviceInjection[i].inject();
            InjectorService.add(i, serviceInjection[i].class());

        }

        return InjectorService;

    }

    getSecurity(
        access_control: Map<string, any>,
        auth: Map<string, any>,
        component
    ) {

        var data;

        for (var i in access_control) {
            data = access_control[i];
            if (!data.hasOwnProperty("path") || !data.hasOwnProperty("roles")) throw ('ERROR IN CONFIG SECURITY ACCESS_CONTROL');
        };

        for (var i in auth) {
            data = auth[i];
            if (!data.hasOwnProperty("stateless") || !data.hasOwnProperty("authenticator") || !data.hasOwnProperty("provider")) throw ('ERROR IN CONFIG SECURITY AUTH');
        }

        return this.component("security")(auth, access_control);

    }

    constructor(
        noInjectable: Map<string, any>,
        component,
        Injectable,
    ) {

        //!!!! STOP DYNAMIC INJECTION  !!!!//
        require = false;
        this.component = component;
        this.Injectable = Injectable;
        this.noInjectable = noInjectable;
        this.parameters = Injectable.get("parameters");

    }

}



