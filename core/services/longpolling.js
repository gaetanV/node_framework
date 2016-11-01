(function () {
    'use strict';
    module.exports = LongPolling;
    function LongPolling( $app,$bundles,$yaml,$path, $db,$fs ,router,path) {

        const maxinstance = 20;
        const timeInstance = 2000;
        const timeDos = 100;
        var TASKS=[];
        var path = path ? path : "/event/";
        var guid = require('./lib/guid.js');
 
        
        var clientsSession = [];
        var clients=[];
        
        const stream = require('./lib/stream.js')($db,clients,guid);
        
         if ($bundles) {
            var config = $yaml.safeLoad($fs.readFileSync($path.join(__dirname, "../../", router.resource), 'utf8'));
            stream.addRoute(config,$bundles);
        }

        class BUFFER{
            
            constructor() {
            this.type="buffer";
            this.data=[];
            
             }
             addData(data){
                 var dataJSON=JSON.parse(data);
                 try{
          
                    if(dataJSON.type==="buffer"){
                        var collectionJSON=JSON.parse(dataJSON.data);
                      

                        for(var i in collectionJSON){
                        
                           this.data.push((collectionJSON[i]));
                        }
                     
                    }else{
                        this.data.push(data);
                    }
                   
                }catch(err){
                       console.log(err); 
                }
             }
        };
        
        class CLIENT  {
           constructor(sessionID) {
                this.sessionID = sessionID;
                this.instance = [];
                this.maxdate = Date.now();
             
            }
            garbage(){
                    var vm = this;
                    for (var i in vm.instance) {
                        var client = vm.instance[i];
                        if (client.update < (Date.now() + timeInstance)) {
                            delete vm.instance[i];
                            delete clients[i];
                        }
                    }
            }
            addInstance (pollingId) {
                this.instance[pollingId] = {
                    id: pollingId,
                    sessionID:this.sessionID,
                    create: {date: Date.now()},
                    update: {date: Date.now()},
                    send:function(data){
                  
                        if(!TASKS[this.id]){tasks=new BUFFER()}else{
                            var tasks= TASKS[this.id];
                        };
                        tasks.addData(data);
                       
                           
                        
                        TASKS[this.id]=tasks;
     
                    }
                    
                }
                clients[pollingId]=this.instance[pollingId];
                this.maxdate = Date.now();
            }
        }


        $app.post(path, function (req, res, next) {
            try {
             

                if (!clientsSession[req.sessionID]) {
                    clientsSession[req.sessionID] = new CLIENT(req.sessionID);
                } else {
                    if (Date.now() < clientsSession[req.sessionID].maxdate + timeDos) {
                        throw "prevent denial of service"
                    }
                }

                clientsSession[req.sessionID].garbage();

                if (!req.body.sid) {
                    var id = guid();
                        
                    if (Object.keys(clientsSession[req.sessionID].instance).length < maxinstance) {
                        clientsSession[req.sessionID].addInstance(id);
                        
                        setTimeout(function () {
                            res.send(JSON.stringify({
                                type: "buffer",
                                data: JSON.stringify([
                                    JSON.stringify({type: "CONNECTION", sid: id}), JSON.stringify({type: "MESSAGE", data: "now you can register @event"})
                                ])
                            }))
                        }, timeDos);

                    } else {
                        throw "max connection for this session"
                    }
                } else {
                     var clientID=req.body.sid;
                     var watch= req.body.watch;
                     var pull= req.body.pull;
                     var buffer=[];
                    for (var i in watch){
                          var message=JSON.parse(watch[i]);
                          
                          
                            
                           var mystream = stream.getStream(message.watch, {});
                              
                        
                           if(!mystream.client[clientID]){
                              
                                  mystream.register(clients[clientID]);
                                  buffer.push(JSON.stringify({type: "data", watch: message.watch, data: JSON.stringify(mystream.data)}));
                           }
     
                     }
                      for (var i in pull){
                           var message=JSON.parse(pull[i]);
                          

                           var mystream = stream.getStream(message.pull, {});
                         
                           buffer.push(JSON.stringify({type: "pull", watch: message.pull, data: JSON.stringify(mystream.data)}));
                   
                      }
                     
                     
                     if(buffer.length>0){
                      
                             res.send(JSON.stringify(
                                            {type: "buffer",  data: JSON.stringify(buffer)}
                                    ));
                         
                        // res.send(JSON.stringify({type: "MESSAGE", data: "BUFFER"}));
                     }else{
                          res.phase = 0;
                         checkUpdate(req, res);
                     }
               
                  
                }

            } catch (err) {

            
                res.status(401).send(err);
            }
        });

        function checkUpdate(req, res)
        {
            
            try {
                var sid=req.body.sid;
                if(TASKS[sid]){
                    
                    
                     res.send(JSON.stringify(
                             {type: "buffer" , data: JSON.stringify(TASKS[sid].data) }
                     ));
                    
                    TASKS[sid]=false;
                }else{
                    res.phase++;


                    if (res.phase >= 25) {
                        res.send("reload");
                    } else {
                        setTimeout(function () {
                            checkUpdate(req, res)
                        }, 1000);
                    }
                }
              
               
            } catch (err) {
                console.log(err);
            }

        }
        

        return {
              updateEntity: stream.updateEntity
        }

    }
})();