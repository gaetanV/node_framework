var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var jsYaml = require('js-yaml');
var fs = require('fs');

var config = jsYaml.safeLoad(fs.readFileSync("./app/config.yml", 'utf8'));

if (!config.framework)
    throw "error can't load the framework";

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

for (var i in config.framework.bundles) {
    gulp.task(i, function () {
        return gulp.src([
            "./core/bundle/Bundle.ts",
            "./core/bundle/decoration/Controller.decoration.ts",
            "./core/bundle/decoration/Controller/**/*.ts",
            "./src/" + i + "/Controller/*.ts",
            "./core/bundle/decoration/ViewSQL/**/*.ts",
            "./src/" + i + "/ViewSQL/*.ts",
            "./core/bundle/lockController.ts",
            "./core/bundle/exportBundle.ts",
        ])
        .pipe(ts({
            target: "es2017",
            noImplicitAny: true,
            outFile: i + '.js',
            experimentalDecorators: true,
        }))
        .pipe(gulp.dest('dist/'));
    });
}

gulp.task('node_dist', function () {
    return gulp.src(config.framework.node.map(a => "./node_modules/" + a))
    .pipe(concat('node.js'))
    .pipe(gulp.dest('web/dist/'));
});

//////////////////////////

gulp.task('bundles', Object.keys(config.framework.bundles), function () {});

gulp.task('web', ['node_dist'], function () {});

gulp.task('watch', ['core', 'bundles'], function () {
    gulp.watch('core/**/*.ts', ['core']);
    for (var i in config.framework.bundles) {
        gulp.watch("./src/" + i + "/**/*.ts", [i]);
    }
    gulp.watch('core/bundle/**/*.ts', Object.keys(config.framework.bundles));
})

gulp.task('deploy', ['core', 'web', 'bundles'], function () {});
