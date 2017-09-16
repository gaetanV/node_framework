class Injectable {

    collection:Map<string,Function> = {};

    constructor(){}
    
    get(name:string) {
        return this.collection[name];
    }

    add(
        name:string,
        func :Function
    ){
 
        name = name.replace(/-([a-z])/g, function (m, w) {
            return w.toUpperCase();
        });

        this.collection[name] = func;
    }
    
    match(collection:Array<string>){
        
        collection.forEach((a)=>{
            if(this.collection[a]){
                
                
            }else{
              
            
            }
        });  
    }
    
    getInjects() {
        return Object.assign({}, this.collection);
    }

}

