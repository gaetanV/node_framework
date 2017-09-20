@Service({
    selector: "db"
})
class{
   
    constructor(){
        return {user: [{id: 1, name: Math.random(), type: "sync", role: ["phantom"]}, {id: 2, name: Math.random(), type: "sync", role: ["USER"]}]};
    }
    
}