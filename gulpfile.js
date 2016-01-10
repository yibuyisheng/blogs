var fs = require('fs');
var gulp = require('gulp');
var marked = require('marked');
var webserver = require('gulp-webserver');
var etpl = require('etpl');
var path = require('path');
var u = require('underscore');
var moment = require('moment');
var sass = require('gulp-sass');

marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

gulp.task('sass', function () {
    gulp.src('./site/sass/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./site/css'));
});

gulp.task('sass:watch', ['sass'], function () {
    gulp.watch('./site/sass/**/*.sass', ['sass']);
});

gulp.task('demos', function (doneFn) {
    var files = fs.readdirSync('./demos');
    buildDemosImg(files.filter(function (file) {
        return file.slice(-5) === '.html';
    }), doneFn);
});

gulp.task('watch-demos', function () {
    gulp.watch('./demos/**/*.html', ['demos']);
});

gulp.task('static-server', function () {
    return gulp.src('./')
        .pipe(webserver({
            directoryListing: true,
            host: '0.0.0.0'
        }));
});

gulp.task('compile:test', function () {
    return createBlogPages('test');
});

gulp.task('compile:production', function () {
    return createBlogPages('production');
});

gulp.task(
    'dev',
    ['static-server', 'compile:test', 'watch-demos', 'sass:watch'],
    function () {
        return gulp.watch([
            './blogs/*.md',
            './site/**/*.conf',
            './site/template.tpl.html'
        ], [
            'compile:test'
        ]);
    }
);

gulp.task('build', ['compile:production', 'demos']);

function buildDemosImg(demoFileNames, doneFn) {
    demoFileNames.forEach(function (fileName) {
        var counter = 0;
        buildDemo(fileName, function () {
            counter++;
            if (counter === demoFileNames.length) {
                doneFn();
            }
        });
    });

    function buildDemo(fileName, doneFn) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.open('./demos/' + fileName, function (status) {
                    if (status === 'success') {
                        page.render('./demos/' + fileName + '.png');
                    }

                    ph.exit();
                    doneFn();
                });
            });
        });
    }
}

function createBlogPages(env) {
    var etplEngin = new etpl.Engine();
    etplEngin.compile(fs.readFileSync(path.join(__dirname, 'site/template.tpl.html')).toString());

    etplEngin.addFilter('md', function (mdCode) {
        return marked(mdCode)
            .replace(/url\(\.\/imgs\//g, 'url(../../imgs/')
            .replace(/src="\.\/imgs\//g, 'src="../../imgs/');
    });

    var config = JSON.parse(fs.readFileSync('./site/' + env + '.conf'));

    var mdFiles = fs.readdirSync(path.join(__dirname, 'blogs'));
    mdFiles = mdFiles.filter(function (fileName) {
        return /\.md$/.test(fileName);
    }).map(function (fileName) {
        var fullPath = path.join(__dirname, 'blogs', fileName);
        var content = fs.readFileSync(fullPath).toString();
        var time = getBlogTime(content);
        return {
            fileName: fileName,
            path: fullPath,
            content: content,
            time: time,
            timeText: moment(time).format('YYYY-MM-DD HH:mm:ss'),
            brief: getBlogBrief(content),
            title: fileName.slice(0, -3)
        };
    });

    var blogs = mdFiles.sort(function (a, b) {
        return b.time.getTime() - a.time.getTime();
    });

    blogs.forEach(function (blog) {
        fs.writeFileSync(
            path.join(__dirname, '/site/blogs', blog.fileName.slice(0, -3) + '.html'),
            etplEngin.getRenderer('blogPage')(getData({blog: blog}))
        );
    });

    fs.writeFileSync(
        path.join(__dirname, 'site/index.html'),
        etplEngin.getRenderer('indexPage')(getData({blogs: blogs}))
    );
    fs.writeFileSync(
        path.join(__dirname, '/README.md'),
        etplEngin.getRenderer('readmeTitleList')(getData({blogs: blogs}))
    );

    function getData(local) {
        return u.extend({}, config, local);
    }

    function getBlogBrief(mdStr) {
        var briefMatch = mdStr.match(/<!--\s*config.brief:(.+)-->/);
        if (briefMatch && briefMatch.length >= 2) {
            return briefMatch[1].replace(/^\s|\s$/g, '');
        }
        return '';
    }

    // 拿到 blog 发布时间
    function getBlogTime(mdStr) {
        var timeMatch = mdStr.match(/<!--\s*config.time:\s*([0-9\-:\s]+)\s*-->/);
        if (timeMatch && timeMatch.length >= 2) {
            return new Date(timeMatch[1]);
        }
        return new Date();
    }
}
