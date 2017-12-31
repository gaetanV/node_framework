
var http = require('http'); 
const nodeFramework = require('./build/Release/nodeFramework');

const routeFunc =
[
    (res)=>{
        console.log("no match");
    },
    (res)=>{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("index.html");
     
    },
    (res)=>{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("index.py");
    },
    (res)=>{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("index.php");
    },
    (res)=>{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write("index.aspx");
    }
]


nodeFramework.route("/index.html");
nodeFramework.route("/index.py");
nodeFramework.route("/index.php");
nodeFramework.route("/index.aspx");
nodeFramework.route("/intro1.php");
nodeFramework.route("/index.bmp");

console.log(nodeFramework.match("/index.aspx"));

/*
http.createServer(function (req, res) {

    routeFunc[nodeFramework.match(req.url)](res);
    res.end();
res.end();
}).listen(8080);
*/






