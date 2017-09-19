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
        engine:string,
        InjectorService) {
        
        this.component("bundle")( name, controller, engine, InjectorService);
        
        
        
        
        /*
        var vm = this;
        

            var config = this.Injectable.get("jsYaml").safeLoad(this.Injectable.get("fs").readFileSync(this.parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
            if (!config.hasOwnProperty("framework")) throw ('ERROR IN CONFIG FRAMEWORK');

            if (config.framework.hasOwnProperty("bundles")) {

                if (!config.framework.hasOwnProperty("router")) throw ('ERROR IN CONFIG ROUTE');
                if (!config.framework.router.hasOwnProperty("resource")) throw ('ERROR IN CONFIG ROUTE');

                var bundles = config.framework.bundles;
                var router = config.framework.router;

                var BUNDLES = [];


                var processed = 0;
                var nbTask = Object.keys(bundles).length;

                for (var i in Bundle) {
                    BUNDLES[i] = this.component("bundle")( i,bundles[i], Bundle, InjectorService);
                    console.log(BUNDLES[i]);
                }
            }
                
              
             
                function route() {

                    var fs: FsInterface = vm.Injectable.get("fs");

                    var doc = vm.Injectable.get("jsYaml").safeLoad(fs.readFileSync(vm.Injectable.get("path").join(vm.parameters.getParameter("server.root_dir"), router.resource), 'utf8'));
                    for (var i in doc) {
                        if (!doc[i].hasOwnProperty("resource") || !doc[i].hasOwnProperty("prefix")) {
                            throw "ERROR IN ROUTE";
                        }

                        var routes = vm.Injectable.get("jsYaml").safeLoad(fs.readFileSync(vm.Injectable.get("path").join(vm.parameters.getParameter("kernel.bundle_dir"), doc[i].resource), 'utf8'));
                        var racine = doc[i].prefix;
                        for (var i in routes) {
                            var route = routes[i];
                            if (route.defaults.hasOwnProperty("_controller")) {

                                var c = route.defaults._controller;
                                var controller = c.split(":");
                                var bundleName = controller[0];
                                var controllerName = controller[1];
                                var functionName = controller[2];
                                var fn = BUNDLES[bundleName].controllers[controllerName].action[functionName];
                                var services = BUNDLES[bundleName].services;
                                var parser = BUNDLES[bundleName].parser;


                                if (!fn) {
                                    throw "THE FUNCTION " + functionName + " DON'T EXISTE"
                                }
                                vm.component("route")(
                                    route.methods.map(function (m) {
                                        return m.toUpperCase()
                                    }),
                                    route.requirements,
                                    fn,
                                    racine + route.path.replace(/{([^}]*)}/g, ":$1"),
                                    services,
                                    parser
                                );

                            }
                        }

                    }
                    resolve(BUNDLES);
                    */
 
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



