(function () {
    'use strict';
    module.exports = Db;
    function Db() {
      return {user:[{id:1,name:Math.random(),type:"sync",role:["phantom"]}, {id:2,name:Math.random(),type:"sync",role:["USER"]}]};
    }
})();