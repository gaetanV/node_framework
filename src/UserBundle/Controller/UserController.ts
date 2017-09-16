@Controller({
    path : "/test/"
})
class UserController {
    
  
    @GetMapping({
        path: "/super",
    })
    get() : string {
        console.log("PING");
        return "hello";
    }
    
    
    @StreamMapping({
        path : "/super",
        persitence: [];
    })
    getOneStream() : string {
      
    }
    
 
}