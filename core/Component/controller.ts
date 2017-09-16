@Component({
    selector: "controller",
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
                        var fn = controller[i];
                        
                        fn.get = function (namespace) {
                           return services[namespace];
                        }
                        
                        actions[actionName[1]] = fn;
           
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
                        var fn = controller[i];
                        
                        fn.get = function (namespace) {
                           return services[namespace];
                        }
                        
                        actions[actionName[1]] = fn;
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