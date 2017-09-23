@Controller({
    path : "/"
})
class ViewSQLController {
    
    @StreamMapping({
        path : "/user/:id/",
        persitence: [];
    })
    getOne() : string {
        
        var db = this.get("db");
        /// GET FROM BD
        var data = db.user[0];

        return data;
    }
    
    @StreamMapping({
        path : "/user/",
        persitence: [];
    })
    
    getAll() : string {
        
        var db = this.get("db");
        /// GET FROM BD
        var data = {users: {u: db.user.slice(0)}};

        return data;
    }
    
    
 
}

