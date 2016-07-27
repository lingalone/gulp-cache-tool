var gulp = require('gulp');
var debug = require('gulp-debug');
var gutil = require('gulp-util');
var uglify  = require("gulp-uglify");
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var del = require('del');
var fs = require("fs");
var path = require("path");
var upath = require("upath"); // 用于处理文件路径的跨平台
var revCollector = require("gulp-rev-collector");
var clean = require('gulp-clean');
var config = require('./config.js');


// 路径变量
/*
var path = {
    // 开发环境
    dev: {
        src:  '../insight2-web/src/main/resources/static',
        app:  '../insight2-web/src/main/webapp'
    },
    // 发布环境
    rev: {
        src:  '../insight2-web/src/main/resources/static-rev',
        app:  '../insight2-web/src/main/webapp-rev'
    }
};*/
//var path = config.path;

var path = {
    // 开发环境
    dev: {
        src:  '',
        app:  ''
    },
    // 发布环境
    rev: {
        src:  '',
        app:  ''
    }
};
path.dev.src = config.path.dev.src;
path.rev.src = config.path.rev.src;
path.dev.app = config.path.dev.app;
path.rev.app = config.path.rev.app;


// 遍历文件
function travel(dir, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);

        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback);
        } else {
            callback(pathname);
        }
    });
}

gulp.task("copy",function(){
    gulp.src([path.dev.src+'/**/**/**/**/**/*'])
        .pipe(gulp.dest(path.rev.src))
});


// 清理rev生成文件
gulp.task("clean", function(){
    //return del(["static-rev/**/**/**/**"])
    //return del(["F:/workspace/1_0/insight2/webapp/**/**/**"],{dryRun: true})
    return gulp.src('../webapp/', {read: false})
        .pipe(clean({force: true}))
});

// 压缩JS
gulp.task('js', function () {
  //选择在static下非js/lib下所有的js
    gulp.src([path.dev.src+'/js/**/**/*.js','!'+path.dev.src+'/js/lib/**/*.js'])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(uglify().on('error', gutil.log)) // notice the error event here
        .pipe(rev())
  //另存到static-rev
        .pipe(gulp.dest(path.rev.src+'/js'))
        .pipe(rev.manifest({
            base:path.dev.src,
            merge: true // merge with the existing manifest (if one exists)
        }))
        .pipe(gulp.dest('/')); // write manifest to build dir
  //将static/lib内容转存到static-rev/lib中
    gulp.src([path.dev.src+'/js/lib/**/*.js'])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(gulp.dest(path.rev.src+'/js/lib'))
});

// 压缩css
gulp.task('css', function () {
    gulp.src([path.dev.src+'/css/**/**/*.css','!'+path.dev.src+'/css/kendo/**/*.css'])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(minifyCss().on('error', gutil.log)) // notice the error event here
        .pipe(rev())
        .pipe(gulp.dest(path.rev.src+'/css'))
        .pipe(rev.manifest({
            base:path.dev.src,
            merge: true // merge with the existing manifest (if one exists)
        }))
        .pipe(gulp.dest('/')); // write manifest to build dir
        //don`t hash resources
    gulp.src([path.dev.src+'/css/kendo/**/*'])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(gulp.dest(path.rev.src+'/css/kendo'))
});



gulp.task('images',function(){
    gulp.src([path.dev.src+'/images/**/**/*.+(png|gif|jpg)'])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(rev())
        .pipe(gulp.dest(path.rev.src+'/images/'))
        .pipe(rev.manifest({
            base:"/",
            merge: true // merge with the existing manifest (if one exists)
        }))
        .pipe(gulp.dest('/')); // write manifest to build dir
    })

//对html,jsp等格式rev处理
gulp.task('rev',function(){
        //gulp.src(['rev-manifest.json','../webapp/webapp/**/**/**/*.+(htm|html|php|jsp|asp)'])
        gulp.src(['rev-manifest.json',path.dev.app+'/**/**/**/*.+(htm|html|php|jsp|asp)'])
          .pipe(debug({title: 'gulp-debug:'}))
          .pipe(revCollector({
            replaceReved: true
          }))
          //.pipe(gulp.dest('../webapp-rev/a/'));
          .pipe(gulp.dest(path.rev.app+'/'));
    });


gulp.task('config', function(){

})

gulp.task('default', ['js', 'css','rev']);


gulp.task('dev', function(){
    var manifest = {};
    var bath = ["webapp", "resources"];
    for(var i = 0; i < bath.length; i ++) {
        travel(bath[i], function(pathname){
            pathname = upath.normalize(pathname).replace(/^webapp\/|^resources\//, "");
            manifest[pathname] = pathname;
        })
    }
    fs.writeFile("dev-manifest.json", JSON.stringify(manifest, null, "\t"), function(err){
        if(err) throw err;
    });
});
