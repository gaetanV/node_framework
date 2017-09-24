@Controller({
    path : "/"
})
class UserController {
    
  
    @GetMapping({
        path: "/:id",
        requirements: {
            id: "\\d+"
        }
    })
    setOneAction(id) {
        var event = this.get("$event");
       
        var data = {name: Math.random(), id: parseInt(id)};
        event.emit("updateEntity", {entity: "user", id: id, data: data});
        return this.render('index.pug', {name: "objects change"});
 
    }
    

}

