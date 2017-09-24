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

    updateEntity(entityname, id, collection) {
    
        var vm = this;
        if (this.PERISISTENCE.hasOwnProperty(entityname)) {
            
            var buffer = [];
            var rooms = this.PERISISTENCE[entityname].rooms;

            var processed = 0;
            var nbTask = rooms.length;
            var clients = this.clients;
            
            for (var i in rooms) {
                processed++;
                for (var j in rooms[i].collection) {
                    nbTask++;
                    //var b=cache [j].reload(load);    
                    //                         /// RELOAD REQUEST
                    rooms[i].collection[j].uploadEntity(entityname, collection, load);     /// PERISTENCE REQUEST 
                    function load(b) {
                        for (var userid in b) {
                            if (!buffer[userid]) {
                                buffer[userid] = b[userid];

                            } else {
                                for (var k in b[userid].data) {
                                    buffer[userid].data.push(b[userid].data[k]);
                                }
                            }
                        }
                        
                        processed++;
                        if (processed >= nbTask) update();
                        
                    }
                }
            
               
            }
            
            function update() {
                for (var userid in buffer) {
                    try {
                        var client = clients[userid];
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
 

                return this.STREAM[i].getSpace(r, {}, path, this.CACHE);
            }
        }
        return false;
    }
    
    addRoute(BUNDLE) {

        function parse(options) {
            return BUNDLE.func.apply(BUNDLE.func, options);
        }
   
        this.setStream(new this.component('room')(
            BUNDLE.path, 
            parse, 
            BUNDLE.requirements || {}, 
            BUNDLE.persitence || {}, 
            this.PERISISTENCE,
            this.clients
        ));


    }

}

