@Controller({
    path : "/"
})
class UserController {
    
  
    @GetMapping({
        path: "/super/:id",
        requirements: {
            id: "\\d+"
        }
    })
    get() {
        return this.render('index.pug', {name: "objects change" + this.request.get("id")});
    }
    
    
    @StreamMapping({
        path : "/super",
        persitence: [];
    })
    getOneStream() : string {
      
    }
    
 
}