(function () {
    'use strict';
    function cache(type, $fs, $path, $uuid, $monk) {

        var db = $monk('localhost:27017/hostel');
        var collection = db.get("query");

        var cachefile = $path.join(this.container.getParameter("kernel.cache_dir"), "query");
        function factory(type) {

            switch (type) {

                case "file":
                    var deleteFolderRecursive = function (path) {
                        if ($fs.existsSync(path)) {
                            $fs.readdirSync(path).forEach(function (file, index) {
                                var curPath = path + "/" + file;
                                if ($fs.lstatSync(curPath).isDirectory()) { // recurse
                                    deleteFolderRecursive(curPath);
                                } else { // delete file
                                    $fs.unlinkSync(curPath);
                                }
                            });
                            //  $fs.rmdirSync(path);
                        }
                    }
                    var path = cachefile;
                    deleteFolderRecursive(path);
            }


            var MEMORY = [];
            return class CACHE {
                constructor() {

                    var uniqueID = $uuid.v4();
                    this.id = uniqueID;
                    this.write = false;
                    this.path = $path.join(cachefile, this.id);

                }

                getData(callback) {

                    var vm = this;

                    switch (type) {
                        case "mongo":
                            try {
                                return checkUpdate();
                                function checkUpdate() {
                                    if (!vm.write) {

                                        collection.findOne({id: vm.id}, {}, function (err, result) {
                                            if (err) {
                                                throw  ("Request failed: get cache");
                                                console.log(err);
                                                return false;
                                            } else {

                                                var data = (result.data);

                                                callback(data);
                                            }
                                            ;
                                        });

                                    } else {

                                        var s = setTimeout(checkUpdate, 100);

                                    }
                                }
                            } catch (err) {
                                console.log(err);
                                return "";
                            }

                            break;
                        case "file":
                            try {
                                return checkUpdate();
                                function checkUpdate() {
                                    if (!vm.write) {
                                        if ($fs.existsSync(vm.path)) {
                                            var t = $fs.readFileSync(vm.path, 'utf8');

                                            var data = JSON.parse(t);

                                            callback(data);

                                        } else {
                                            return "";
                                        }
                                    } else {

                                        var s = setTimeout(checkUpdate, 100);

                                    }
                                }
                            } catch (err) {
                                console.log(err);
                                return "";
                            }
                            break;
                        case "memory":

                            callback(MEMORY[this.id]);
                            break;
                    }
                }

                set data(data) {
                    var vm = this;
                    switch (type) {
                        case "mongo":
                            vm.write = true;
                            var data = {id: vm.id, data: data};
                            //findOneAndUpdate
                            collection.update({id: vm.id}, data, function (err, result) {

                                if (err) {
                                    console.log(err);
                                    return false;
                                }
                                if (result.nModified === 0) {
                                    collection.insert(data, function (err, result) {
                                        vm.write = false;
                                        if (err) {
                                            console.log("err");

                                            console.log(err);
                                            return false;
                                        }
                                    });
                                } else {
                                    vm.write = false;

                                }

                            });

                            return data;
                            break;

                        case "file":
                            vm.write = true;
                            $fs.writeFile(this.path, JSON.stringify(data), function (error) {
                                vm.write = false;
                                if (error) {
                                    console.error("write error:  " + error.message);
                                } else {

                                    return data;
                                }
                            });
                            break;
                        case "memory":
                            return MEMORY[this.id] = data;
                            break;
                    }

                }
            }
        }
        return factory;
    }
    module.exports = cache;

})();


