(() => {

    var PRIVATE:Array<Map<string,any>> = {}
    var instance:number = 0;
    
    @Component({
        selector: "DependencyInjection/parameters",
        provider: []
    })
    class {

        PARAMS: Map<string, any>;
        instance: number;
        PARAM = class PARAM {

            freeze: boolean = false;
            value: string | Map<string, any> = "";

            constructor(data, freeze) {
                this.data = data;
                this.freeze = freeze;

            }
            get data(): string | Map<string, any> {
                return this.value;
            }

            set data(data: string | Map<string, any>): void {
                if (this.freeze) {
                    console.log("FREEZE");
                    return false;
                }
                this.value = data;
            }

        }

        constructor() {
            Object.defineProperty(this, 'instance', {value: instance++, writable: false, enumerable: false, configurable: false});
            PRIVATE[this.instance] = { PARAMS : {} };
        }

        getParameter(namespace: string): string | Map<string, any> {

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
                PRIVATE[this.instance].PARAMS[namespace] = new this.PARAM(value, freeze);
                return true;
            }
            return false;
        }

    }
    
})();
