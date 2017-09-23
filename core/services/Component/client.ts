@Component({
    selector: "client"
})
class {
    
    constructor(sessionID) {
        this.sessionID = sessionID;
        this.instance = [];
        this.maxdate = Date.now();
        this.timeInstance = 2000;

    }
    garbage(clients) {
        var vm = this;
        for (var i in vm.instance) {
            var client = vm.instance[i];
            if (client.update < (Date.now() + this.timeInstance)) {
                delete vm.instance[i];
                delete clients[i];
            }
        }
    }
    addInstance(pollingId,clients) {
        this.instance[pollingId] = {
            id: pollingId,
            sessionID: this.sessionID,
            create: {date: Date.now()},
            update: {date: Date.now()},
            send: function (data) {

                if (!TASKS[this.id]) {
                    tasks = new BUFFER()
                } else {
                    var tasks = TASKS[this.id];
                }
                ;
                tasks.addData(data);
                TASKS[this.id] = tasks;
            }
        }
        clients[pollingId] = this.instance[pollingId];
        this.maxdate = Date.now();
    }
}