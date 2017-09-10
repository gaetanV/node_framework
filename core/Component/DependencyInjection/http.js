(function () {
    'use strict';
    module.exports = http;
    function http(vm, fn) {
        console.log(vm);
        var args = this.use("/Component/DependencyInjection/inject")().getArguments(fn);
        var vm = vm ? vm : {};
        return  {
            apply: function (vmInject, params) {

                for (var i in vmInject) {
                    vm[i] = vmInject[i];
                }
                var injectParam = [];
                for (var i in args) {

                    if (params) {
                        if (params[args[i]]) {

                            injectParam[i] = params[args[i]];

                        }
                    }

                }

                return  fn.apply(vm, injectParam);
            }
        }
    }
})();