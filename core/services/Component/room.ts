function ENTITY() {
    this.rooms = [];
}
@Component({
    selector: "room"
})
class {

    constructor(path, fn, requirements, persistence,PERISISTENCE) {
       
        this.persistence = persistence;
        for (var i in persistence) {
            if (persistence[i].hasOwnProperty("targetEntity")) {
                var entity = persistence[i].targetEntity;
                if (!PERISISTENCE[entity]) {
                    PERISISTENCE[entity] = new ENTITY();
                }
                PERISISTENCE[entity].rooms.push(this);
            }
        }

        this.fn = fn;
        this.path = path;
        this.requirements = requirements;
        var cache = [];
        this.getCache = function () {
            return cache;
        }
    }
    getSpace(param, option, path, CACHE) {
        var cache = this.getCache();
        var o = JSON.stringify(option);
        var p = JSON.stringify(param);
        var index = (p != undefined ? p : "{}") + "-" + (o != undefined ? o : "{}");
        if (!cache.hasOwnProperty(index)) {
            var options = Object.keys(param).map(
                function (k) {
                    return param[k];
                }
            );

            cache[index] = new this.component('space')(index, path, this.fn, options, this.persistence,CACHE);
        }
        return cache[index];
    }


}