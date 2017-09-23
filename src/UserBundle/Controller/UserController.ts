@Controller({
    path : "/user"
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
    

}

