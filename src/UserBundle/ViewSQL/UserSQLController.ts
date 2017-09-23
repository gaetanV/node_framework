@Controller({
    path : "/"
})
class UserSQLController {
    
    @StreamMapping({
        path : "/{id}/",
        persitence: [],
        requirements: {
            id: "\\d+"
        }
    })
    getOne() : string {
        
        var db = this.get("db");
        /// GET FROM BD
        var data = db.user[0];

        return data;
    }
    
    @StreamMapping({
        path : "/",
        persitence: [];
    })
    
    getAll() : string {
        
        var db = this.get("db");
        /// GET FROM BD
        var data = {users: {u: db.user.slice(0)}};

        return data;
    }
    
    
 
}

