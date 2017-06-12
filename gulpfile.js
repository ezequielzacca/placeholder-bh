const gulp = require('gulp');
const ts = require('gulp-typescript');
const JSON_FILES = ['src/*.json', 'src/**/*.json','!src/wwwroot/*'];
const WWWROOT = ['src/wwwroot/**'];
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('browser-sync', ['nodemon', 'watch'], function () {
    browserSync.init(null, {
        proxy: "localhost:3004",
        files: ["dist/public/**/*.*", "dist/views/**/*.*"],
        port: 7000,
    });
});

// run nodemon on server file changes
gulp.task('nodemon', function (cb) {
    var started = false;

    return nodemon({
        script: 'dist/index.js',
        watch: ['dist/*.js']
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function onRestart() {
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, 500);  // browserSync reload delay
    });
});

gulp.task('scripts',['wwwroot','assets'], () => {
    const tsResult = tsProject.src().pipe(sourcemaps.init())
        .pipe(tsProject());
return tsResult.js.pipe(sourcemaps.write({
      // Return relative source map root directories per file.
      sourceRoot: function (file) {
        var sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    })).pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('assets', function() {
    return gulp.src(JSON_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('wwwroot', function() {
    return gulp.src(WWWROOT)
        .pipe(gulp.dest('dist/wwwroot'));
});

gulp.task('default', ['browser-sync']);