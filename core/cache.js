(function () {
    'use strict';
    function cache(type){
        var $fs = require('fs');
        var $path = require("path");
        var guid = require("./services/lib/guid.js");
        
        switch(type){
                        
                        case "file":
                            var deleteFolderRecursive = function(path) {
                                          if( $fs.existsSync(path) ) {
                                            $fs.readdirSync(path).forEach(function(file,index){
                                              var curPath = path + "/" + file;
                                              if($fs.lstatSync(curPath).isDirectory()) { // recurse
                                                deleteFolderRecursive(curPath);
                                              } else { // delete file
                                                $fs.unlinkSync(curPath);
                                              }
                                            });
                                          //  $fs.rmdirSync(path);
                                          }
                            }
                            var path=$path.join(__dirname, "../","app","cache","query");
                                  deleteFolderRecursive(path);   
                    }
 
           
       var MEMORY=[];
            class CACHE {
                constructor() {
                    var uniqueID=guid();
                    this.id=uniqueID;
                    this.write=false;
                    this.path=$path.join(__dirname, "../","app","cache","query", this.id);
                    
                }
            

                getData(callback){
                    var vm=this;
                    switch(type){
                        
                        case "file":
                            try{
                                return checkUpdate();
                                function checkUpdate(){
                                   // console.log("checkUpdate");
                                    if(!vm.write){
                                        if ($fs.existsSync(vm.path)){
                                               var t=$fs.readFileSync(vm.path, 'utf8');
                                               console.log(t);
                                               var data=JSON.parse(t);
                                               //console.log(data);
                                              //  console.log("endofsync");
                                                    callback(data);
                                         
                                        }else{   
                                            return "";
                                        }
                                   }else{
                                     
                                       var s=setTimeout(checkUpdate, 100);
                                
                                   }
                                }
                            }catch(err){
                                  console.log(err);
                                  return "";
                            }
                            break;
                        case "memory":
                                 callback(MEMORY[this.id]);
                            break;
                    }
                }
                
                
                set data(data){
                   var vm=this;
                    switch(type){
                        case "file":
                            vm.write=true;
                             $fs.writeFile(this.path, JSON.stringify(data), function (error) {
                                    vm.write=false;
                                    if (error) {
                                     console.error("write error:  " + error.message);
                                   } else {
                                       
                                     return data;
                                   }
                             });
                            break;
                        case "memory":
                              return MEMORY[this.id]=data;  
                            break;
                     }
                 
                }
            }
            return CACHE;
       }
         module.exports = cache;

 })();  
  
        
