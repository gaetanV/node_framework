@Component({
    selector: "buffer"
})
class {

    constructor() {
        this.type = "buffer";
        this.data = [];
    }

    addData(data) {
        var dataJSON = JSON.parse(data);
        try {
            if (dataJSON.type === "buffer") {
                var collectionJSON = JSON.parse(dataJSON.data);
                for (var i in collectionJSON) {
                    this.data.push((collectionJSON[i]));
                }
            } else {
                this.data.push(data);
            }
        } catch (err) {
            console.log(err);
        }
    }


}