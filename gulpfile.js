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
var obfuscate = require('gulp-obfuscate');
var gulpSequence = require('gulp-sequence').use(gulp);
// 路径变量

var path = {
    // 开发环境
    dev: {
        src:  '',
        dont_change_src:{
          css: '',
          js: '',
          img: ''
        },
        app: ''
    },
    // 发布环境
    rev: {
        src:  '',
        dont_change_src:{
          css: '',
          js: '',
          img: ''
        },
        app:  ''
    }
};
path.dev.src = config.path.dev.src;
path.rev.src = config.path.rev.src;
path.dev.app = config.path.dev.app;
path.rev.app = config.path.rev.app;
path.dev.dont_change_src.css = config.path.dev.dont_change_src.css;
path.dev.dont_change_src.js = config.path.dev.dont_change_src.js;
path.dev.dont_change_src.img = config.path.dev.dont_change_src.img;
path.rev.dont_change_src.css = config.path.rev.dont_change_src.css;
path.rev.dont_change_src.js = config.path.rev.dont_change_src.js;
path.rev.dont_change_src.img = config.path.rev.dont_change_src.img;

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


// 清理rev生成文件
gulp.task("clean", function(){
    return gulp.src(['rev-manifest.json',path.rev.src,path.rev.app], {read: false})
        .pipe(clean({force: true}))
});
//单独清理rev-manifest.json
gulp.task("clean-manifest", function(){
    return gulp.src(['rev-manifest.json'], {read: false})
        .pipe(clean({force: true}))
});

// 压缩JS
gulp.task('js', function () {

    gulp.src([path.dev.src+'/js/**/**/*.js','!'+path.dev.src+path.dev.dont_change_src.js],{base:path.dev.src})
        .pipe(debug({title: 'gulp-debug:'}))
        //压缩js
        .pipe(uglify().on('error', gutil.log)) // notice the error event here
        //混淆js
        .pipe(obfuscate())
        //重命名，保存在path.rev.src
        .pipe(rev())
        .pipe(gulp.dest(path.rev.src))
        //建立manifest.json
        .pipe(rev.manifest({
            base:'/',
            merge: true
        }))
        //存到根目录
        .pipe(gulp.dest('/'));
    //复制不变数据到指定文件夹
    gulp.src([path.dev.src+path.dev.dont_change_src.js])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(gulp.dest(path.rev.src+path.rev.dont_change_src.js))
});

// 压缩css
gulp.task('css',function (cb) {

    //gulpSequence('clean-manifest', cb);
    gulp.src([path.dev.src+'/**/**/**/*.css','!'+path.dev.src+path.dev.dont_change_src.css],{base:path.dev.src})
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(minifyCss().on('error', gutil.log))

        .pipe(rev())
        .pipe(gulp.dest(path.rev.src))

        .pipe(rev.manifest({
            base:'/',
            merge: true
        }))
        .pipe(gulp.dest('/'));

    gulp.src([path.dev.src+path.dev.dont_change_src.css])
        .pipe(debug({title: 'gulp-debug:'}))
        .pipe(gulp.dest(path.rev.src+path.rev.dont_change_src.css))
});



gulp.task('images',function(){
    gulp.src([path.dev.src+path.dev.dont_change_src.img])
        .pipe(debug({title: 'gulp-debug:'}))
        //.pipe(rev())
        .pipe(gulp.dest(path.rev.src+path.rev.dont_change_src.img))
        // .pipe(rev.manifest({
        //     base:"/",
        //     merge: true // merge with the existing manifest (if one exists)
        // }))
        // .pipe(gulp.dest('/')); // write manifest to build dir
    })

//对html,jsp等格式rev处理
gulp.task('rev',function(){

        gulp.src(['rev-manifest.json',path.dev.app+'/**/**/**/*.+(htm|html|php|jsp|asp)'])
          .pipe(debug({title: 'gulp-debug:'}))
          .pipe(revCollector({
            replaceReved: true
          }))
          .pipe(gulp.dest(path.rev.app+'/'));
    });

// gulp.task('one',['clean']);
 gulp.task('src',['js', 'css','images']);
// gulp.task('three',['rev']);
// gulp.task('default', gulpSequence('one','tow','three'));



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
