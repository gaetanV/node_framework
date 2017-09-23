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
        /// GET FROM BD
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
                attributes:{
                     name: "~"
                }   
            }
        };
    })
    
    getAll() : string {
       
        
        var db = this.get("db");
        /// GET FROM BD
        var data = {users: {u: db.user.slice(0)}};

        return data;
    }
    
    
 
}

