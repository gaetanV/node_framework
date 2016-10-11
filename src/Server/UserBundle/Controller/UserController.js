(function () {
    'use strict';
    function UserController(app){   
        return{
            getAllAction:function(req, res, next) {
                try {
                    res.end('All User');
                } catch (err) {
                    next("[]");
                    return false;
                };
             },
             getOneAction:function(req, res, next) {
                try {
                    var id = parseInt(req.params.id);
                    res.end('User id '+id);
                } catch (err) {
                    next("[]");
                    return false;
                };
             }
             
        } 
    };
    module.exports = UserController;
})();