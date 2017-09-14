(() => {

    var PRIVATE: Array<Map<string, any>> = {}
    var instance: number = 0;

    @Component({
        selector: "EventDispatcher/event",
        provider: []
    })
    class {

        constructor() {
            Object.defineProperty(this, 'instance', {value: instance++, writable: false, enumerable: false, configurable: false});
            PRIVATE[this.instance] = {TASK: {}};

        }

        on(
            namespace: string,
            callback
        ) {
            if (!PRIVATE[this.instance].TASK[namespace])
                PRIVATE[this.instance].TASK[namespace] = [];
            PRIVATE[this.instance].TASK[namespace].push(callback);

        }

        emit(
            namespace: string,
            data
        ) {
            if (PRIVATE[this.instance].TASK[namespace]) {
                for (var i in PRIVATE[this.instance].TASK[namespace]) {
                    PRIVATE[this.instance].TASK[namespace][i](data);
                }
            }
        }

    }

})();