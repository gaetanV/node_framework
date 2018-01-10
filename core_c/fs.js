const nodeFs = require('./fs/build/Release/fs');

nodeFs.open(function(content) {
    console.log(content);
});