@Component({
    selector: "HttpKernel/controller",
    provider: []
})
class{

    constructor(file, services) {
        var vm = this;

        function evalController(controller) {

            require = false;
            var actions = [];
            var Controller = function (controller) {
                for (var i in controller) {
                    var m = new RegExp('^(.*)Action$', 'gi');
                    var actionName = m.exec(i);
                    if (actionName) {
                        actions[actionName[1]] = vm.component("DependencyInjection/http")(

                            {
                                get: function (namespace) {
                                    return services[namespace];
                                }
                            },
                            controller[i],

                        );


                    }
                }
            }


            eval(controller);
            return actions;
        }

        function evalStream(controller) {

            require = false;
            var actions = [];
            var Controller = function (controller) {
                for (var i in controller) {
                    var m = new RegExp('^(.*)Stream$', 'gi');
                    var actionName = m.exec(i);
                    if (actionName) {
                        actions[actionName[1]] = vm.component("DependencyInjection/http")(
                            {
                                get: function (namespace) {
                                    return services[namespace];
                                }
                            },
                            controller[i],
                        );
                    }
                }
            }


            eval(controller);
            return actions;
        }

        return {
            services: services,
            action: evalController(file),
            stream: evalStream(file)
        }

    }


}