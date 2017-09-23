@Component({
    selector: "stream",
    provider: []
})
class {

    constructor(clients, CACHE) {
        this.clients = clients;
        this.CACHE = CACHE;
        this.STREAM = [];
        this.PERISISTENCE = [];
    }

    updateEntity(entityname, id, object) {

        var vm = this;
        if (this.PERISISTENCE.hasOwnProperty(entityname)) {
            var buffer = [];
            var rooms = this.PERISISTENCE[entityname].rooms;

            var processed = 0;
            var nbTask = rooms.length;
            for (var i in rooms) {

                var room = rooms[i];
                var cache = room.getCache();

                for (var j in cache) {
                    //var b=cache [j].reload(load);                             /// RELOAD REQUEST
                    cache[j].uploadEntity(entityname, object, load);     /// PERISTENCE REQUEST 
                    function load(b) {
                        function bufferUser(userid) {
                            if (!buffer[userid]) {
                                buffer[userid] = b[userid];

                            } else {
                                for (var k in b[userid].data) {
                                    buffer[userid].data.push(b[userid].data[k]);
                                }
                            }
                        }
                        for (var userid in b) {
                            bufferUser(userid)
                        }
                    }
                }
                processed++;

                if (processed >= nbTask) {
                    update();
                }

            }

            function update() {
                console.log("update");
                for (var userid in buffer) {
                    try {
                        var client = this.clients[userid];
                        var data = buffer[userid].data;
                        client.send(JSON.stringify({type: "buffer", data: JSON.stringify(data)}));
                    } catch (err) {
                        console.log(err);
                        console.log("---------CLIENT DESTROY--------------");
                        delete vm.client[i];
                    }
                }

            }

        }
        return false;
    }

    setStream(route) {
        route.param = [];
        if (route.path.match(/{([^{}]*)}/g)) {
            var t = route.path.replace(/{([^{}]*)}/g,
                function (match) {

                    var c = match.slice(1, -1);
                    route.param.push(c);
                    if (route.requirements.hasOwnProperty(c)) {
                        var r = route.requirements.id;
                        return "([" + r + "^/])";
                    }
                    return "([.^/]{1,})"
                }
            );
        } else {
            var t = route.path;
        }
        route.regex = new RegExp('^' + t + '$', 'gi');
        this.STREAM.push(route);
    }
    
    getStream(path, option) {

        for (var i in this.STREAM) {
            if (path.match(this.STREAM[i].regex)) {
                var r = {};
                var t = this.STREAM[i].regex.exec(path);

                for (var j = 0; j < this.STREAM[i].param.length; j++) {
                    r[this.STREAM[i].param[j]] = t[j + 1];
                }
                ;

                return this.STREAM[i].getSpace(r, {}, path, this.CACHE);
            }
        }
        return false;
    }
    
    addRoute(BUNDLE) {

        function parse(options) {
            return BUNDLE.func.apply(BUNDLE.func, options);
        }
        var option = {
            path: BUNDLE.path,
            fn: parse,
            requirements: BUNDLE.requirements || {},
            persitence: BUNDLE.persitence || {}
        }
        this.setStream(new this.component('room')(option.path, option.fn, option.requirements, option.persitence, this.PERISISTENCE));


    }

}

