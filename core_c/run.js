
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

//console.log(nodeFramework.fastMatch("/index.html"));
console.log(nodeFramework.match("/index.html?a=5&b=8"));

const OldNodeFramework = require('./build/Release/OldNodeFramework');

/*
// OK TRUE
OldNodeFramework.routeParam("/test/abc/index.html?a=$&b=$");
OldNodeFramework.match("/test/abc/index.html?a=5&b=8");

OldNodeFramework.routeParam("/test/$/index.html");
OldNodeFramework.match("/test/abc/index.html?a=5&b=8");
*/

OldNodeFramework.routeParam("/test/$/$");
OldNodeFramework.match("/test/abc/index.html?a=5&b=8");

/*
// OK TRUE
OldNodeFramework.routeParam("/$/$/$.$");
OldNodeFramework.routeParam("/$/$/$.html");
OldNodeFramework.routeParam("/test/$/index.html");
OldNodeFramework.routeParam("/$/$/index.html");

// OK FALSE
OldNodeFramework.routeParam("/$/abcd/$.html");
OldNodeFramework.routeParam("/$/$/$/index.html");
OldNodeFramework.routeParam("/tet/$/index.html");
OldNodeFramework.routeParam("/$/$/index.h");

OldNodeFramework.match("/test/abc/index.html");

OldNodeFramework.param("?test=54&re=super");
OldNodeFramework.param("?test=");
OldNodeFramework.param("?test=a&");
*/

/*
http.createServer(function (req, res) {

    routeFunc[nodeFramework.match(req.url)](res);
    res.end();
res.end();
}).listen(8080);
*/






