var fs = require('fs');
var gulp = require('gulp');
var gulpJade = require('gulp-jade');
var jade = require('jade');
var marked = require('marked');
var webserver = require('gulp-webserver');
var gutil = require('gulp-util');
var etpl = require('etpl');

marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

jade.filters.md = function (str) {
    return marked(str)
        .replace(/url\(\.\/imgs\//g, 'url(../../imgs/')
        .replace(/src="\.\/imgs\//g, 'src="../../imgs/');
};

// 生成对应于 src 目录下面的 md 博客文件的 jade 文件
// 以及 titles.jade
gulp.task('create-blog-pages', function (doneFn) {
    try {
        var srcPath = './src';
        var mdFiles = fs.readdirSync(srcPath);
        mdFiles.forEach(function (fileName) {
            if (fileName.slice(-3) !== '.md') {
                return;
            }

            var jadeFilePath = process.cwd() + '/site/blogs/' + fileName.slice(0, -3) + '.jade';
            var jadeContent = etpl.compile([
                'extends ../bloglayout.jade',
                'block title',
                '    | ${blogTitle}',
                'block nav',
                '    a(href="#{rootPath}/index.html") 首页',
                '    | &nbsp;&nbsp;》',
                '    | ${blogTitle}',
                'block blog',
                '    include:md ../../src/${fileName}'
            ].join('\r'))({blogTitle: fileName.slice(0, -3), fileName: fileName});

            fs.writeFileSync(jadeFilePath, jadeContent);
        });

        // 排一下序
        mdFiles = mdFiles.map(function (fileName) {
            var mdStr = fs.readFileSync(srcPath + '/' + fileName);
            return {
                time: getBlogTime(String(mdStr)),
                fileName: fileName
            };
        }).sort(function (a, b) {
            return b.time.getTime() - a.time.getTime();
        }).map(function (fileObj) {
            return fileObj.fileName;
        });

        var titlesContent = etpl.compile([
            '<!-- for: ${blogs} as ${blog} -->',
            'h5\r',
            '    a(href="#{rootPath}/blogs/${blog.title}.html") ${blog.title}\r',
            '<!-- /for -->'
        ].join(''))({
            blogs: mdFiles.filter(
                function (fileName) {
                    return fileName.slice(-3) === '.md';
                }
            ).map(
                function (fileName) {
                    return {
                        title: fileName.slice(0, -3)
                    };
                }
            )
        });
        fs.writeFileSync(process.cwd() + '/site/titles.jade', titlesContent);

        doneFn();
    }
    catch (error) {
        doneFn(error);
    }

    // 拿到 blog 发布时间
    function getBlogTime(mdStr) {
        var timeMatch = mdStr.match(/<!-- config.time: ([0-9|\-|:|\s]+) -->/);
        if (timeMatch && timeMatch.length >= 2) {
            return new Date(timeMatch[1]);
        }
        return new Date();
    }
});


gulp.task('static-server', function () {
    return gulp.src('./')
        .pipe(webserver({
            directoryListing: true,
            host: '0.0.0.0'
        }));
});

gulp.task(
    'watch',
    ['static-server', 'create-blog-pages', 'compile:test'],
    function () {
        return gulp.watch([
            './src/*.md',
            './site/**/*.jade',
            './site/**/*.conf'
        ], [
            'create-blog-pages',
            'compile:test'
        ]);
    }
);

gulp.task('compile:test', function () {
    return gulpCompile(process.cwd() + '/site/test.conf');
});

gulp.task('compile:production', function () {
    return gulpCompile(process.cwd() + '/site/production.conf');
});

gulp.task('build', ['create-blog-pages', 'compile:production']);

function gulpCompile(configFilePath) {
    return gulp.src([
        process.cwd() + '/site/blogs/**/*.jade',
        process.cwd() + '/site/index.jade',
        process.cwd() + '/site/mobile.jade'
    ]).pipe(gulpJade({
        locals: JSON.parse(fs.readFileSync(configFilePath))
    })).on('error', function (error) {
        gutil.log(error.message);
    }).pipe(gulp.dest(function (file) {
        return file.base;
    }));
}
