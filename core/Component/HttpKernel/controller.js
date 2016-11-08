(function () {
    'use strict';
    var ControllerBundle = function (file,services) {
        var vm = this;
    
        return {
            services: services,
            action: evalController(file),
            stream: evalStream(file)
        }
       

        function evalController(controller) {
            require = false;
            var actions = [];
            var Controller = function (controller) {
                for (var i in controller) {
                    var m = new RegExp('^(.*)Action$', 'gi');
                    var actionName = m.exec(i);
                    if (actionName) {
                        actions[actionName[1]] = vm.use("/Component/DependencyInjection/http").inject({
                            vm: {
                                 get: function (namespace) {
                                    return services[namespace];
                                 },
                            },
                            fn: controller[i],
                        }
                        );


                    }
                }
            }
            eval(controller);
            return actions;
        }
        ;
        function evalStream(controller) {
            require = false;
            var actions = [];
            var Controller = function (controller) {
                for (var i in controller) {
                    var m = new RegExp('^(.*)Stream$', 'gi');
                    var actionName = m.exec(i);
                    if (actionName) {
                        actions[actionName[1]] = vm.use("/Component/DependencyInjection/http").inject({
                            vm: {
                                 get: function (namespace) {
                                    return services[namespace];
                                 },
                            },
                            fn: controller[i],
                        }
                        );
                    }
                }
            }
            eval(controller);
            return actions;
        }
        ;



    };
    module.exports = ControllerBundle;
})();