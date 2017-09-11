class kernel {
    
    parameters: any;
    namespace: string = __dirname;
    maxAge : number = 1 * 365 * 24 * 60 * 60 * 1000;
    injectable: Array<string>;
    services:  Map<string,any>
    
    startServer(
                Port: number, 
                Host: string, 
    ):void {
        var express = this.injectable["express"]();
        var server = this.injectable["http"].createServer(express);
        server.listen(Port, Host);

        this.parameters.setParameter("server",
             {
                 root_dir: this.injectable["path"].join(__dirname, ".."),
                 host: Host,
                 port: Port,
             }, true
        );

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
    
    setService(
        config_services: Map<string,any>,
        injection,
        DependencyInjection,
        Autoload
    ){
        
        for (var i in config_services) {
            var service = config_services[i];

            if (!service.hasOwnProperty("class")) throw ('ERROR IN CONFIG SERVICE');

            var inject = DependencyInjection();

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

            var autoload = Autoload(
                this.injectable["path"].join(__dirname, "..", path.join("/")),
                inject ,
                this.injectable["fs"],
                this.injectable["path"]
            );
    
            inject.addThis("use", autoload);
            inject.addThis("container", this.parameters);

            var service = autoload(cl).inject(service.params ? service.params : {});

            this.services[i] = service;
            injection.addInject(i, service);

        }
    }
    
   
    setBundle(
              bundles,
              injection,
              router,
    ): Array<any> {
       
    
        var vm = this;
        var BUNDLES = [];
        injection.addInject("bundles", BUNDLES);
        
        var $bundle = this.use("/Component/HttpKernel/bundle");

        var processed = 0;
        var nbTask = Object.keys(bundles).length;
       
          
        for (var i in bundles) {
            var bundle = bundles[i];
            // BUNDLES[i] =  $bundle.inject({name:i,params:bundles[i],services:Object.assign({}, this.services),callback:callback});
            BUNDLES[i] = $bundle.inject({name: i, params: bundles[i], services: this.services, callback: callback});
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
          
             //!!!! STOP DYNAMIC INJECTION  !!!!//
            require = false;
           
            var injection = DependencyInjection();
            injection.addInject("inject", DependencyInjection);
            
            for(var i in injectable){    
                var c = i.toLowerCase().replace(/-([a-z])/g, function (m, w) {
                    return w.toUpperCase();
                }););
                injection.addInject(c, injectable[i]);
            }
             
            /* AUTOLOAD */
            this.use = Autoload(this.namespace, injection, this.injectable["fs"], this.injectable["path"]);
            injection.addThis("use", this.use);
            
            /* PARAMETERS */   
            this.parameters = this.use("/Component/DependencyInjection/parameters").inject();
            this.parameters.setParameter("kernel",
                 {
                     root_dir: this.injectable["path"].join(__dirname, "../app/"),
                     cache_dir: this.injectable["path"].join(__dirname, "../app/cache"),
                     web_dir: this.injectable["path"].join(__dirname, "../web/"),
                     bundle_dir: this.injectable["path"].join(__dirname, "../src/"),
                     logs_dir: this.injectable["path"].join(__dirname, "../app/logs"),
                 }, true
            );
            injection.addThis("container", this.parameters)
         
           
            var $app = this.startServer(Port, Host);
            injection.addInject("app", $app);
            
            /* HTTP */
            
            var config = this.injectable["js-yaml"].safeLoad(this.injectable["fs"].readFileSync(this.parameters.getParameter("kernel.root_dir") + "config.yml", 'utf8'));
            
            if (!config.hasOwnProperty("framework")) throw ('ERROR IN CONFIG FRAMEWORK');
            if (!config.hasOwnProperty("security")) throw ('ERROR IN CONFIG SECURITY');
            
            var framework = config.framework;
            
            $app.use(this.injectable["body-parser"].json(), this.injectable["body-parser"].urlencoded({extended: true}), this.injectable["cookie-parser"]());

            if (framework.hasOwnProperty("compression_gzip")) {
                if (framework.compression_gzip === true) {
                    $app.use(this.injectable["compression"]({threshold: 0, filter: function () {
                            return true;
                        }}))
                }
            }

            /* SESSION */

            $app.set('trust proxy', 1)
            
            $app.use(this.injectable['express-session']({
                secret: this.injectable["node-uuid"].v4(), 
                name: 'session', 
                id: this.injectable["node-uuid"].v4(), 
                store: new this.injectable['express-session'].MemoryStore, 
                resave: true, 
                saveUninitialized: true, 
                cookie: {httpOnly: true}
            }));

            /* SECURITY */
       
            var security = config.security;
            if (!security.hasOwnProperty("index"))  throw ('ERROR IN CONFIG SECURITY INDEX');
        
            var $security = this.getSecurity(
                security.hasOwnProperty("access_control")?security.access_control:[],
                security.hasOwnProperty("auth")?security.auth:[]
            );

            $app.use(
                    "/",
                    $security.firewall,
                    $security.auth,
                    this.injectable["express"].static(this.parameters.getParameter("kernel.web_dir"), {
                        maxAge: this.maxAge, 
                        index: security.index
                    })
            );


            /* EVENT DISPATCHER */
            var $event = this.use("/Component/EventDispatcher/event").inject();
            injection.addInject("event", $event);

            /* CACHE FACTORY */
            injection.addInject("cache", this.use("/Component/Cache/cache").inject());

      
            /* ZONE */
            
            /* SERVICE */
                   
            this.services = {
                event: $event,
            }
            
    
            this.setService(
                config.hasOwnProperty("services")?config.services:[],
                injection,
                DependencyInjection,
                Autoload
             );
            
   
            if (framework.hasOwnProperty("bundles")) {
                
                if (!framework.hasOwnProperty("router")) throw ('ERROR IN CONFIG ROUTE');
                if (!framework.router.hasOwnProperty("resource")) throw ('ERROR IN CONFIG ROUTE');

                this.setBundle(
                    framework.bundles,
                    injection,
                    framework.router,
                );

            }

        } catch (err) {
            console.log(err);
        }
    }
}



