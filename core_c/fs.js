const nodeFs = require('./fs/build/Release/fs');

nodeFs.open("./route.js",function(content) {
    console.log(content);
});