@Component({
    selector: "EventDispatcher/event",
    provider: []
})
class {

    constructor() {
        super();
        this.TASK = [];
    }

    on(
        namespace: string,
        callback
    ) {
        if (!this.TASK [namespace])
            this.TASK [namespace] = [];
        this.TASK [namespace].push(callback);

    }

    emit(
        namespace: string,
        data
    ) {
        if (this.TASK [namespace]) {
            for (var i in this.TASK [namespace]) {
                this.TASK [namespace][i](data);
            }
        }
    }

}