(function () {
    'use strict';
    function Parameters() {
        var PARAMS = [];
        class PARAM {
            constructor(data, freeze) {
                this.freeze = false;
                this.data = data;
                this.freeze = freeze;


            }
            get data() {
                return this.value;
            }

            set data(data) {
                if (this.freeze) {
                    console.log("FREEZE");
                    return false;
                }
                this.value = data;
            }

        }

        function getParameter(namespace) {
            var t = namespace.split(".");
            namespace = t[0];
            if (!hasParameter(namespace)) {
                return false;
            } //PARAM  NO EXIST
            var data = PARAMS[namespace].data;
            if (!data) {
                return false;
            }//FREEZE
            var result = data;

            for (var i = 1; i < t.length; i++) {

                result = result[t[i]];
            }



            return result;
        }

        function hasParameter(namespace) {
            return PARAMS[namespace] ? true : false;
        }
        function setParameter(namespace, value, freeze) {

            if (!hasParameter(namespace)) {
                PARAMS[namespace] = new PARAM(value, freeze);
            }
            return false;
        }

        return {

            setParameter: setParameter,
            getParameter: getParameter,
            hasParameter: hasParameter

        }
    }

    module.exports = Parameters;

})();