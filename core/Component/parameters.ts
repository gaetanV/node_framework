(() => {
    interface privateInterface {
        PARAMS: any
    }

    var PRIVATE: Array<privateInterface> = [];
    var instance: number = 0;
    
    class PARAM {

        freeze: boolean = false;
        value: string | Map<string, any> = "";

        constructor(data, freeze) {
            this.data = data;
            this.freeze = freeze;
        }

        get data(): string | Map<string, any> {
            return this.value;
        }

        set data(data: string | Map<string, any>){
            if (this.freeze) {
                console.log("FREEZE");
            }
            this.value = data;
        }

    }

    @Component({
        selector: "parameters",
        provider: []
    })
    class parameters{

        instance:number;

        constructor() {
            Object.defineProperty(this, 'instance', {value: instance++, writable: false, enumerable: false, configurable: false});
            PRIVATE[this.instance] = { PARAMS : {} };
        }

        getParameter(namespace: string): string | Map<string, any> | boolean {

            var t = namespace.split(".");
            namespace = t[0];
            if (!this.hasParameter(namespace)) {
                return false;
            } //PARAM  NO EXIST
            var data = PRIVATE[this.instance].PARAMS[namespace].data;
            if (!data) {
                return false;
            }//FREEZE
            var result = data;

            for (var i = 1; i < t.length; i++) {

                result = result[t[i]];
            }
            return result;
        }

        hasParameter(namespace: string): boolean {
            return PRIVATE[this.instance].PARAMS[namespace] ? true : false;
        }

        setParameter(
            namespace: string,
            value: string | Map<string, any>,
            freeze: boolean
        ): boolean {
            if (!this.hasParameter(namespace)) {
                PRIVATE[this.instance].PARAMS[namespace] = new PARAM(value, freeze);
                return true;
            }
            return false;
        }

    }
    
})();
