@Controller({
    path : "/"
})
class UserSQLController {
    
    @StreamMapping({
        path : "/{id}/",
        persitence: {
            OneToOne:{
                targetEntity: "user"
                join: "id"
            }
        },
        requirements: {
            id: "\\d+"
        }
    })
    getOne(id) : string {
    
        var db = this.get("db");
        /// GET YOUR QUERY FROM YOUR FAVORITE BD ENGINE
        var data = db.user[0];

        return data;
    }
    
    @StreamMapping({
        path : "/",
        persitence: {
            OneToMany:{
                targetEntity: "user"
                join:  "id"
                referenced: "users.u" 
            }
        };
    })
    getAll() : string {
       
        
        var db = this.get("db");
        /// GET YOUR QUERY FROM YOUR FAVORITE BD ENGINE
        var data = {users: {u: db.user.slice(0)}};

        return data;
    }
    
    
 
}

