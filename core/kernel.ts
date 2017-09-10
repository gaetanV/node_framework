class kernel {
    
    parameters: any;
    namespace: string = __dirname;
    
    private injectable: Array<string>;
    
    startServer(
                Port: number, 
                Host: string, 
    ):void {
        var express = this.injectable["express"]();
        var server = this.injectable["http"].createServer(express);
        server.listen(Port, Host);
        return express;
    }
    
    getSecurity(
        access_control: Map<string,any>,
        auth: Map<string,any>
    ){
        
        var data;
        
        for(var i in access_control){
            data = access_control[i];
            if (!data.hasOwnProperty("path") || !data.hasOwnProperty("roles"))  throw ('ERROR IN CONFIG SECURITY ACCESS_CONTROL');
        };

        for(var i in auth){
            data = auth[i];
            if (!data.hasOwnProperty("stateless") || !data.hasOwnProperty("authenticator") || !data.hasOwnProperty("provider")) throw ('ERROR IN CONFIG SECURITY AUTH');
        }
      
        return this.use("/Component/Security/security").inject({
            ACCESS_CONTROL: access_control,
            AUTH: auth}
        );
        
    }
    
    setBundle(
              bundles,
              injection,
              router,
              config_services,
              $event
    ): Array<any> {
        
    
       /* SERVICES */
        var services = {
            event: $event,
        }
    
        var vm = this;
        var BUNDLES = [];
        
        var $bundle = this.use("/Component/HttpKernel/bundle");

        var processed = 0;
        var nbTask = Object.keys(bundles).length;
        
        injection.addInject("bundles", BUNDLES);

        for (var i in config_services) {
            var service = config_services[i];
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

            var namespace = this.injectable["path"].join(__dirname, "..", path.join("/"));

            var autoload = vm.use("/Component/ClassLoader/autoload").inject({path: namespace, injection: inject});

            inject.addThis("use", autoload);
            inject.addThis("container", this.parameters);
            var service = autoload(cl).inject(service.params ? service.params : {});
            services[i] = service;
            injection.addInject(i, service);

        }
          
        for (var i in bundles) {
            var bundle = bundles[i];
            // BUNDLES[i] =  $bundle.inject({name:i,params:bundles[i],services:Object.assign({}, this.services),callback:callback});
            BUNDLES[i] = $bundle.inject({name: i, params: bundles[i], services: services, callback: callback});
        }
        
        /* ROUTE */
        function route() {

            var doc = vm.injectable["js-yaml"].safeLoad(vm.injectable["fs"].readFileSync(vm.injectable["path"].join(vm.parameters.getParameter("server.root_dir"), router.resource), 'utf8'));
            for (var i in doc) {
                if (!doc[i].hasOwnProperty("resource") || !doc[i].hasOwnProperty("prefix")) {
                    throw "ERROR IN ROUTE";
                }

                var routes = vm.injectable["js-yaml"].safeLoad(vm.injectable["fs"].readFileSync(vm.injectable["path"].join(vm.parameters.getParameter("kernel.bundle_dir"), doc[i].resource), 'utf8'));
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
                        vm.use("/Component/Routing/route").inject(
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
        }
        

        function callback() {
            processed++;
            console.log("load " + (nbTask / processed) * 100 + "%");
            if (processed >= nbTask) {
                route();
            }
        }

        return BUNDLES;
    }
    
    
    constructor(
                Port: number, 
                Host: string, 
                noInjectable: Map<string,any>, 
                injectable:  Map<string,any>,
                DependencyInjection: (any) => void,
                Autoload: (any) => void,
    ) {
    
        this.injectable = noInjectable;
        
        for(var i in injectable){
            this.injectable[i]= injectable[i];
        }

        try {
            /* SERVER */
            
           
   
            var injection = DependencyInjection(
                    {
                        $yaml: this.injectable["js-yaml"],
                    }
            );
            
            for(var i in injectable){       
                i = i.toLowerCase().replace(/-([a-z])/g, function (m, w) {
                    return w.toUpperCase();
                }););
                
                injection.addInject(i, injectable[i]);
            }
            
            var $app = this.startServer(Port, Host);
            injection.addInject("app", $app);
            
            /* AUTOLOAD */
            this.use = Autoload(this.namespace, injection, this.injectable["fs"], this.injectable["path"]);
            require = false;
            
            //!!!! STOP DYNAMIC INJECTION  !!!!//

            this.parameters = this.use("/Component/DependencyInjection/parameters").inject();
            
            
            injection.addThis("use", this.use);
            injection.addThis("container", this.parameters);

            this.parameters.setParameter("kernel",
                    {
                        root_dir: this.injectable["path"].join(__dirname, "../app/"),
                        cache_dir: this.injectable["path"].join(__dirname, "../app/cache"),
                        web_dir: this.injectable["path"].join(__dirname, "../web/"),
                        bundle_dir: this.injectable["path"].join(__dirname, "../src/"),
                        logs_dir: this.injectable["path"].join(__dirname, "../app/logs"),
                    }, true
                    );
         
            this.parameters.setParameter("server",
                    {
                        root_dir: this.injectable["path"].join(__dirname, ".."),
                        host: Host,
                        port: Port,
                    }, true
                    );

            /* HTTP */
            var config = this.injectable["js-yaml"].safeLoad(this.injectable["fs"].readFileSync(this.parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
            if (!config.hasOwnProperty("framework")) {
                throw ('ERROR IN CONFIG FRAMEWORK')
            }
            var framework = config.framework;
            $app.use(this.injectable["body-parser"].json(), this.injectable["body-parser"].urlencoded({extended: true}), this.injectable["cookie-parser"]());

            if (framework.hasOwnProperty("compression_gzip")) {
                if (framework.compression_gzip === true) {
                    $app.use(this.injectable["compression"]({threshold: 0, filter: function () {
                            return true;
                        }}))
                }
                ;
            }

            /* SESSION */
            var sessionStore = new this.injectable['express-session'].MemoryStore;

            var secret = this.injectable["node-uuid"].v4();
            $app.set('trust proxy', 1)
            $app.use(this.injectable['express-session']({secret: secret, name: 'session', id: this.injectable["node-uuid"].v4(), store: sessionStore, resave: true, saveUninitialized: true, cookie: {httpOnly: true}}));


            /* SECURITY */
            if (!config.hasOwnProperty("security")) {
                throw ('ERROR IN CONFIG SECURITY')
            }
            var security = config.security;
            if (!security.hasOwnProperty("index")) {
                throw ('ERROR IN CONFIG SECURITY INDEX')
            }

            var access_control = security.hasOwnProperty("access_control")?security.access_control:[];
            var auth = security.hasOwnProperty("auth")?security.auth:[];
 
            var $security = this.getSecurity(access_control,auth);
                

            var maxAge = 1 * 365 * 24 * 60 * 60 * 1000;
            $app.use("/",
                    $security.firewall,
                    $security.auth,
                    this.injectable["express"].static(this.parameters.getParameter("kernel.web_dir"), {maxAge: maxAge, index: security.index})
                    );


            /* EVENT DISPATCHER */
            var $event = this.use("/Component/EventDispatcher/event").inject();
            injection.addInject("event", $event);

            /* CACHE FACTORY */
            var $cache = this.use("/Component/Cache/cache").inject();
            injection.addInject("cache", $cache);


            /* ZONE */
            if (framework.hasOwnProperty("bundles")) {
                
                if (!framework.hasOwnProperty("router")) throw ('ERROR IN CONFIG ROUTE');
                if (!framework.router.hasOwnProperty("resource")) throw ('ERROR IN CONFIG ROUTE');
                
                this.setBundle(
                                framework.bundles,
                                injection,
                                framework.router,
                                config.hasOwnProperty("services")?config.services:[],
                                $event
                );

            }

        } catch (err) {
            console.log(err);
        }
    }
}



