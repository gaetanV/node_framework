class kernel {
    
    noInjectable: Map<string,any> = [];
    injectable: Map<string,any> = [];
    
    constructor(Port: number, Host: string, noInjectable: Map<string,any>, injectable:  Map<string,any>) {
       
        try {
            /* SERVER */
            this.server = injectable["http"].createServer($app);
            this.server.listen(Port, Host);

            /* INJECTION */
            var $parameters = false;
            
            var $app = noInjectable["express"]();
            var $yaml = noInjectable["js-yaml"];
            var $compression = noInjectable["compression"];
            var $session = noInjectable["express-session"];
            var $bodyParser = noInjectable["body-parser"];      
            var $cookieParser = noInjectable["cookie-parser"];  
            var $path = noInjectable["path"];
            var $fs = noInjectable["fs"];
            var $uuid = noInjectable["node-uuid"];
            var $express = noInjectable["express"];
            
            this.use = false;
           
            this.namespace = __dirname;
            var injection = require($path.join(__dirname, "/Component/DependencyInjection/inject.js"))(
                    {
                        $fs: injectable["fs"],
                        $path: injectable["path"],
                        $yaml: injectable["js-yaml"],
                        $http: injectable["http"],
                        $express: injectable["express"],
                        $app: $app,
                        $uuid: injectable["node-uuid"],
                        $monk: injectable["monk"],
                        $pug: injectable["pug"],
                        $mustache: injectable["Mustache"],
                        $ws: injectable["ws"]
                    }
            );

            /* AUTOLOAD */
            this.use = require($path.join(__dirname, "/Component/ClassLoader/autoload.js"))(this.namespace, injection, $fs, $path);
            require = false;
            //!!!! STOP DYNAMIC INJECTION  !!!!//

            $parameters = this.use("/Component/DependencyInjection/parameters").inject();



            injection.addThis("use", this.use);
            injection.addThis("container", $parameters);

            $parameters.setParameter("kernel",
                    {
                        root_dir: $path.join(__dirname, "../app/"),
                        cache_dir: $path.join(__dirname, "../app/cache"),
                        web_dir: $path.join(__dirname, "../web/"),
                        bundle_dir: $path.join(__dirname, "../src/"),
                        logs_dir: $path.join(__dirname, "../app/logs"),
                    }, true
                    );
         
            $parameters.setParameter("server",
                    {
                        root_dir: $path.join(__dirname, ".."),
                        host: Host,
                        port: Port,
                    }, true
                    );

            /* HTTP */
            var config = $yaml.safeLoad($fs.readFileSync($parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
            if (!config.hasOwnProperty("framework")) {
                throw ('ERROR IN CONFIG FRAMEWORK')
            }
            var framework = config.framework;
            $app.use($bodyParser.json(), $bodyParser.urlencoded({extended: true}), $cookieParser());

            if (framework.hasOwnProperty("compression_gzip")) {
                if (framework.compression_gzip === true) {
                    $app.use($compression({threshold: 0, filter: function () {
                            return true;
                        }}))
                }
                ;
            }

            /* SESSION */
            var sessionStore = new $session.MemoryStore;

            var secret = $uuid.v4();
            $app.set('trust proxy', 1)
            $app.use($session({secret: secret, name: 'session', id: $uuid.v4(), store: sessionStore, resave: true, saveUninitialized: true, cookie: {httpOnly: true}}));


            /* SECURITY */
            if (!config.hasOwnProperty("security")) {
                throw ('ERROR IN CONFIG SECURITY')
            }
            var security = config.security;
            if (!security.hasOwnProperty("index")) {
                throw ('ERROR IN CONFIG SECURITY INDEX')
            }


            var ACCESS_CONTROL = {};
            if (security.hasOwnProperty("access_control")) {
                for (var i in security.access_control) {
                    var data = security.access_control[i];
                    if (!data.hasOwnProperty("path") || !data.hasOwnProperty("roles")) {
                        throw ('ERROR IN CONFIG SECURITY ACCESS_CONTROL')
                    }
                    ACCESS_CONTROL[i] = data;
                }
                ;
            }
            var AUTH = {};
            if (security.hasOwnProperty("auth")) {

                for (var i in security.auth) {
                    var data = security.auth[i];
                    if (!data.hasOwnProperty("stateless") || !data.hasOwnProperty("authenticator") || !data.hasOwnProperty("provider")) {
                        throw ('ERROR IN CONFIG SECURITY AUTH')
                    }
                    AUTH[i] = data;
                }
                ;
            }
            var $security = this.use("/Component/Security/security").inject({
                ACCESS_CONTROL: ACCESS_CONTROL,
                AUTH: AUTH}
            );


            var maxAge = 1 * 365 * 24 * 60 * 60 * 1000;
            $app.use("/",
                    $security.firewall,
                    $security.auth,
                    $express.static($parameters.getParameter("kernel.web_dir"), {maxAge: maxAge, index: security.index})
                    );

            /* EVENT DISPATCHER */
            var $event = this.use("/Component/EventDispatcher/event").inject();
            injection.addInject("event", $event);

            /* CACHE FACTORY */
            var $cache = this.use("/Component/Cache/cache").inject();

            injection.addInject("cache", $cache);


            /* SERVICES */
            this.services = {
                event: $event,
            }


            /* BUNDLES */
            var BUNDLES = [];

            if (framework.hasOwnProperty("bundles")) {
                var $bundle = this.use("/Component/HttpKernel/bundle");
                var bundles = framework.bundles;
                var processed = 0;
                var nbTask = Object.keys(bundles).length;

                for (var i in bundles) {
                    var bundle = bundles[i];
                    // BUNDLES[i] =  $bundle.inject({name:i,params:bundles[i],services:Object.assign({}, this.services),callback:callback});
                    BUNDLES[i] = $bundle.inject({name: i, params: bundles[i], services: this.services, callback: callback});
                }

                function callback() {
                    processed++;
                    console.log("load " + (nbTask / processed) * 100 + "%");
                    if (processed >= nbTask) {
                        route();
                    }
                }
            }
            var vm = this;

            /* ROUTE */
            function route() {
                injection.addInject("bundles", BUNDLES);
                if (config.hasOwnProperty("services")) {
                    for (var i in config.services) {
                        var service = config.services[i];
                        if (!service.hasOwnProperty("class")) {
                            throw ('ERROR IN CONFIG SERVICE')
                        }
                        var inject = vm.use("/Component/DependencyInjection/inject").inject({});

                        if (service.hasOwnProperty("arguments")) {
                            var injectPotential = injection.getInjects();
                            for (var j in service.arguments) {
                                var value = service.arguments[j];
                                if (injectPotential[value]) {
                                    inject.addInject(value.slice(1), injectPotential[value]);
                                }
                            }
                        }
                        var path = service.class.split("/");
                        var cl = path.pop();

                        var namespace = $path.join(__dirname, "..", path.join("/"));

                        var autoload = vm.use("/Component/ClassLoader/autoload").inject({path: namespace, injection: inject});

                        inject.addThis("use", autoload);
                        inject.addThis("container", $parameters);
                        var service = autoload(cl).inject(service.params ? service.params : {});
                        vm.services[i] = service;
                        injection.addInject(i, service);

                    }
                }


                if (!framework.hasOwnProperty("router")) {
                    throw ('ERROR IN CONFIG ROUTE')
                }
                ;
                if (!framework.router.hasOwnProperty("resource")) {
                    throw ('ERROR IN CONFIG ROUTE')
                }


                var doc = $yaml.safeLoad($fs.readFileSync($path.join($parameters.getParameter("server.root_dir"), framework.router.resource), 'utf8'));

                for (var i in doc) {
                    if (!doc[i].hasOwnProperty("resource") || !doc[i].hasOwnProperty("prefix")) {
                        throw "ERROR IN ROUTE";
                    }

                    var routes = $yaml.safeLoad($fs.readFileSync($path.join($parameters.getParameter("kernel.bundle_dir"), doc[i].resource), 'utf8'));
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
                            var $route = vm.use("/Component/Routing/route").inject(
                                    {
                                        methods: route.methods.map(function (m) {
                                            return m.toUpperCase()
                                        }),
                                        fn: fn,
                                        path: racine + route.path.replace(/{([^}]*)}/g, ":$1"),
                                        requirements: route.requirements,
                                        services: services,
                                        parser: parser,

                                    }

                            );

                        }
                    }

                }
                ;
            }

        } catch (err) {
            console.log(err);
        }
    }
}



