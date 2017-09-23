var gulp = require('gulp');
var ts = require('gulp-typescript');
var jsYaml = require('js-yaml');
var fs = require('fs');

var config = jsYaml.safeLoad(fs.readFileSync("./app/config.yml", 'utf8'));

if(!config.framework) throw "error can't load the framework";

gulp.task('core', function () {
    return gulp.src([
        "./core/kernel/injectable.ts",
        "./core/kernel/**/*.ts",
        "./core/require.ts",
        "./core/Component/**/*.ts",
        "./core/lockComponent.ts", 
        "./core/services/Component/*.ts",
        "./core/services/**/*.ts",
        "./core/lockService.ts"
    ])
    .pipe(ts({
         target: "es2017",
         noImplicitAny: true,
         outFile: 'core.js',
         experimentalDecorators: true,
     }))
     .pipe(gulp.dest('dist/'));
});




for(var i in config.framework.bundles){
    gulp.task(i, function () {
    return gulp.src([
        
        
        "./core/bundle/Bundle.ts",
        "./core/bundle/decoration/Controller.decoration.ts",
        "./core/bundle/decoration/Controller/**/*.ts",
        "./src/"+i+"/Controller/*.ts",
        "./core/bundle/decoration/ViewSQL/**/*.ts",
        "./src/"+i+"/ViewSQL/*.ts",
        "./core/bundle/lockController.ts",
        "./core/bundle/exportBundle.ts",
    ])
    .pipe(ts({
             target: "es2017",
             noImplicitAny: true,
             outFile: i+'.js',
             experimentalDecorators: true,
         }))
         .pipe(gulp.dest('dist/'));
    });
}

gulp.task('watch', ['core'].concat(Object.keys(config.framework.bundles)), function () {
    gulp.watch('core/**/*.ts', ['core']);
    for(var i in config.framework.bundles){
        gulp.watch("./src/"+i+"/**/*.ts", [i]);
    }
    gulp.watch('core/bundle/**/*.ts', Object.keys(config.framework.bundles));
    
});