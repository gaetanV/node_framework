CORE.component("DependencyInjection/parameters", class{
    
    PARAMS = [];
    PARAM = class PARAM {
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

    getParameter(namespace) {
        var t = namespace.split(".");
        namespace = t[0];
        if (!this.hasParameter(namespace)) {
            return false;
        } //PARAM  NO EXIST
        var data = this.PARAMS[namespace].data;
        if (!data) {
            return false;
        }//FREEZE
        var result = data;

        for (var i = 1; i < t.length; i++) {

            result = result[t[i]];
        }



        return result;
    }

    hasParameter(namespace) {
        return this.PARAMS[namespace] ? true : false;
    }
    setParameter(namespace, value, freeze) {

        if (!this.hasParameter(namespace)) {
            this.PARAMS[namespace] = new this.PARAM(value, freeze);
        }
        return false;
    }

},[]);