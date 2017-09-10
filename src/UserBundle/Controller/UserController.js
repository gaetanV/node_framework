(function () {
    'use strict';
    var UserController = {
        getAllAction: function () {
            //UPDATE IN DB
            var db = this.get("db");
            var object = [{name: Math.random(), type: "sync"}, {name: Math.random(), type: "sync"}];
            return this.render('index.pug', {name: "objects change"});

        },
        setOneAction: function (id) {
            var event = this.get("event");
            var object = {name: Math.random(), id: parseInt(id)};


            event.emit("updateEntity", {entity: "user", id: id, data: object});
            return this.render('index.pug', {name: "objects change"});

        },
        getOneStream: function (id) {

            var db = this.get("db");
            /// GET FROM BD
            var data = db.user[0];

            return data;

        },
        getAllStream: function () {
            var db = this.get("db");
            /// GET FROM BD
            var data = {users: {u: db.user.slice(0)}};

            return data;

        },
    };
    
    Controller(UserController);
    
})();