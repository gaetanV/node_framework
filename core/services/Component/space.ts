@Component({
    selector: "space"
})
class {

    constructor(index, path, fn, options, persistence, CACHE) {
        
        this.fn = fn;
        this.options = options; 
        this.client = [];
        this.persistence = [];
        this.path = path;
        this.index = index;
        this.cache = new CACHE();
        
        for (var i in persistence) {
            if (!this.persistence[persistence[i].targetEntity]) this.persistence[persistence[i].targetEntity] = []
            persistence[i].type = i;
            this.persistence[persistence[i].targetEntity].push(persistence[i]);
        }

        var user = 1; // FROM SESSION TO DO 
        this.date = {
            create: {date: Date.now(), user: user},
            update: {date: Date.now(), user: user},
        }
        this.reload();
    }

    uploadEntity(entity, data, callback) {

        var buffer = [];
        var vm = this;
        var processed = 0;
        var nbTask = this.persistence[entity].length;

        for (var i in this.persistence[entity]) {

            var replace = this.persistence[entity][i];
            var index = data[replace.join];

            function load(before) {
                var cible = before;
                if (replace.referenced) {
                    var path = replace.referenced.split(".");
                    for (var i in path) {
                        if (cible[path[i]]) {
                            cible = cible[path[i]];
                        }
                    }
                }
                switch (replace.type) {
                    case "OneToOne":
                        if (cible.id === index) {
                            for (var j in cible) {
                                cible[j] = data[j];
                            }
                            vm.cache.data = before;
                            var b = vm.buffer(
                                function (b) {

                                    for (var userid in b) {
                                        if (!buffer[userid]) {
                                            buffer[userid] = b[userid];
                                        } else {
                                            for (var k in b[userid].data) {
                                                buffer[userid].data.push(b[userid].data[k]);
                                            }
                                        }
                                    }
                                    nbTask++;
                                    if (nbTask >= processed) {

                                        callback(buffer);
                                    }

                                });

                        }
                        break;
                    case "OneToMany":
                        console.log("OneToMany");
                        var indexArray = cible.map(function (d) {
                            return d.id;
                        }).indexOf(parseInt(index));

                        if (indexArray !== -1) {
                            for (var j in cible[indexArray]) {
                                cible[indexArray][j] = data[j];
                            }
                        }

                        vm.cache.data = before;

                        var b = vm.buffer(
                            function (b) {

                                for (var userid in b) {
                                    if (!buffer[userid]) {
                                        buffer[userid] = b[userid];
                                    } else {
                                        for (var k in b[userid].data) {
                                            buffer[userid].data.push(b[userid].data[k]);
                                        }
                                    }
                                    nbTask++;
                                    if (nbTask >= processed) {

                                        callback(buffer);
                                    }
                                }
                            }

                        );
                        break;
                }
            }
            vm.cache.getData(load);
        }
        return buffer;
    }

    register(socket) {
        this.client[socket.id] = socket;
    }

    buffer(callback) {

        var buffer = [];
        var vm = this;
        var processed = 0;
        var nbTask = this.client.length;

        function parseClient(i) {

            vm.cache.getData(function (data) {
                var client = clients[i];
                buffer[i] = ({
                    client: client,
                    data: [JSON.stringify({type: "data", watch: vm.path, data: JSON.stringify(data)})]
                });

                processed++;
                if (processed >= nbTask) {
                    callback(buffer);
                }
            });

        }
        for (var i in this.client) {
            try {
                var client = clients[i];
                if (!client)
                    throw "client destroy";
                parseClient(i);
            } catch (e) {
                delete this.client[i];
            }
        }
    }
    
    reload(callback) {
        var buffer = [];
        var user = 1; // FROM SESSION
        this.date.update = {date: Date.now(), user: user};

        this.cache.data = this.fn(this.options);

        this.buffer(function (b) {

            for (var userid in b) {
                if (!buffer[userid]) {
                    buffer[userid] = b[userid];
                } else {
                    for (var k in b[userid].data) {
                        buffer[userid].data.push(b[userid].data[k]);
                    }
                }
            }
            callback(buffer);
        });



    }
}