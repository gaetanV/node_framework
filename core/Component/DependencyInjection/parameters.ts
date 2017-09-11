@Component({
    selector: "DependencyInjection/parameters",
    provider: []  
})
class {
    
    PARAMS: Map<string,any>;
    
    constructor(){
       super();

       this.PARAMS = [];
    }
    
    PARAMS = [];
    PARAM = class PARAM {
        
        freeze: boolean = false;
        value: string = "";
        
        constructor(data, freeze) {
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
        var data = this._().PARAMS[namespace].data;
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
        return this..PARAMS[namespace] ? true : false;
    }
    
    setParameter(namespace, value, freeze) {

        if (!this.hasParameter(namespace)) {
            this.PARAMS[namespace] = new this.PARAM(value, freeze);
        }
        return false;
    }

}