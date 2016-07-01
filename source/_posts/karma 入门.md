---
title: karma 入门
date: 2016-07-01 10:35:44
tags:
- JavaScript
- test
---

本文介绍了 karma 的入门知识点。
<!-- more -->

# 什么是 karma

karma 是一个提升测试效率的工具，帮助开发者更好更快速地在多种环境下执行测试代码，拿到测试结果。在运行的时候，它会自动启动配置好的浏览器，同时也会启动一个 node 服务器，然后在启动好的浏览器中执行测试代码，并将测试代码执行结果传回给 node 服务器，然后 node 服务器在打印出收到的执行结果。

# 安装 karma

可以通过 npm 安装 karma ：

```
// 本地安装
npm i karma --save-dev

// 全局安装
npm i karma -g
```

# 初始化 karma

安装完成之后，切换到目标项目根目录，运行：

```
karma init
```

这样就会以向导的形式生成 karma 的配置文件 `karma.conf.js` ，文件内容大致为：

```js
// Karma configuration
// Generated on Wed Jun 29 2016 23:22:24 GMT+0800 (CST)

module.exports = function(config) {
    config.set({

        // 根路径，后面配置的基本所有相对路径都会根据这个路径来构造。
        basePath: '',


        // 使用到的框架
        // 目前支持的框架： https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],


        // 将会在浏览器里面执行的代码
        files: [
            'test/main.js',
            {
                pattern: 'src/**/*.js',
                // false 表示初始化的时候不会使用 script 标签直接将相关 js 引入到浏览器，需要自己写代码加载
                included: false
            },
            {
                pattern: 'test/**/*Spec.js',
                included: false
            }
        ],


        // 需要从 files 中排除掉的文件
        exclude: [],


        // 需要做预处理的文件，以及这些文件对应的预处理器。
        // 此处就可以将 coffee 、 ES6 等代码转换一下。
        preprocessors: {
            'src/**/*.js': ['babel', 'coverage'],
            'test/**/!(main).js': ['babel', 'coverage'],
            'node_modules/protectobject/src/**/*.js': ['babel']
        },

        // babel 预处理器的配置
        babelPreprocessor: {
            options: {
                presets: ['es2015', 'stage-0'],
                plugins: ['transform-decorators-legacy', 'transform-es2015-modules-amd']
            }
        },

        // 覆盖率报告器配置
        coverageReporter: {
            type: 'html',
            dir: 'coverage'
        },


        // 实际使用的报告期
        // 可用的报告器： https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots', 'coverage'],


        // 服务器端口号
        port: 9876,


        // 在输出内容（报告器和日志）中启用/禁用颜色
        colors: true,


        // 日志级别
        // 取值： config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // 启用/禁用监视文件变化重新执行测试的功能
        autoWatch: true,


        // 要测试的目标环境
        browsers: ['Chrome', 'Firefox', 'Safari'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
```

# 配置 Require.js

对于 Require.js ，还要注意配置一个入口文件，主要用于配置 Require.js 的模块信息等。

上述 karma 配置文件中的 test/main.js 即为 Require.js 的入口文件，在该文件中的代码一般来说应该是这样的：

```js
var TEST_REGEXP = /(spec|test)\.js$/i;
var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/src',

  // example of using a couple of path translations (paths), to allow us to refer to different library dependencies, without using relative paths
  paths: {
    'jquery': '../lib/jquery',
    'underscore': '../lib/underscore',
  },

  // example of using a shim, to load non AMD libraries (such as underscore)
  shim: {
    'underscore': {
      exports: '_'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
```

# 执行测试

运行如下命令，执行测试：

```
karma start
```

# karma 分析

在执行测试的时候，点击 `debug` 按钮，进入 debug 页面，然后打开浏览器开发者工具，可以看到在 HTML 中有一段 js 代码：

```js
// Configure our Karma
    window.__karma__.config = {"args":[],"useIframe":true,"captureConsole":true,"clearContext":true};


    // All served files with the latest timestamps
    window.__karma__.files = {
  '/base/node_modules/requirejs/require.js': '2c8b45573db27c131094a113e995236d20f043bb',
  '/base/node_modules/karma-requirejs/lib/adapter.js': '2621a4400d4a8a49588243fce2d8609ef950b46a',
  '/base/node_modules/jasmine-core/lib/jasmine-core/jasmine.js': '391e45351df9ee35392d2e5cb623221a969fc009',
  '/base/node_modules/karma-jasmine/lib/boot.js': '945a38bf4e45ad2770eb94868231905a04a0bd3e',
  '/base/node_modules/karma-jasmine/lib/adapter.js': '7975a273517f1eb29d7bd018790fd4c7b9a485d5',
  '/base/test/main.js': 'fc5206f4dff3b583db818cb10ed7c5cade572896',
  '/base/src/State.js': 'db89a58b4570983b8f8febfd4dedbc586c353670',
  '/base/test/StateSpec.js': 'faf31b373690a6d7a7035fdfdc9c85d906ace5c1'
};
```

可以看到 `window.__karma__.files` 中列出了所有的可能会在浏览器中执行的 js ，如果通过 Require.js 加载这里没有列举出来的 js ，就会报错。

然后再看下面的一堆 script 标签，大致是这样的：

```html
<script type="text/javascript" src="/base/node_modules/requirejs/require.js"></script>
<script type="text/javascript" src="/base/node_modules/karma-requirejs/lib/adapter.js"></script>
<script type="text/javascript" src="/base/node_modules/jasmine-core/lib/jasmine-core/jasmine.js"></script>
<script type="text/javascript" src="/base/node_modules/karma-jasmine/lib/boot.js"></script>
<script type="text/javascript" src="/base/node_modules/karma-jasmine/lib/adapter.js"></script>
<script type="text/javascript" src="/base/test/main.js"></script>
  <script type="text/javascript">
    window.__karma__.loaded();
  </script>
```

可以看到，直接引入了 require.js 、 karma 相关的一堆 js 、jasmine 相关的 js ，还直接引入了刚才配置的 test/main.js （Require.js 入口文件）。注意，此处并没有直接引入 `included: false` 的 js 。

## URL 路径中的 `base`

如果仔细看各种资源请求的 URL 地址，会发现除了 `debug.js` 和 `context.js` 之外，其它 js 文件都会以 `/base` 开头，在配置 Require.js 的时候，务必注意这一点。

## coverage

可以引入 karma 的 coverage 插件来查看测试覆盖率，该插件会在目标代码中插入很多额外的代码，用于判断测试代码执行流程有没有走到这些地方。在 debug 的时候，最好关掉 coverage 功能，不然这些额外的代码非常影响调试。

另外 karma-coverage-es6 声称支持 ES6 ，但是似乎并不行？

## jasmine 的 HTML reporter

默认情况下，浏览器中 debug 页面是不会输出任何 jamine 测试结果的，可以借助 `karma-jasmine-html-reporter` 解决这个问题。

但是，`karma-jasmine-html-reporter` 有坑，在该插件的 index.js 中，有这样一段代码：

```js
var createPattern = function(path) {
  return {pattern: path, included: true, served: true, watched: false};
};

var initReporter = function(files,  baseReporterDecorator) {

  baseReporterDecorator(this);

  files.unshift(createPattern(__dirname + '/lib/adapter.js'));
  files.unshift(createPattern(__dirname + '/lib/html.jasmine.reporter.js'));
  files.unshift(createPattern(__dirname + '/css/jasmine.css'));
};

initReporter.$inject = ['config.files',  'baseReporterDecorator'];

module.exports = {
  'reporter:kjhtml': ['type', initReporter]
};
```

`files` 指的就是 karma.conf.js 中配置的 files ，此处使用 `unshift` 方法将这堆 js 、 css 放在了 files 最前面，这样就会导致 `html.jasmine.reporter.js` 先于 `jasmine.js` 加载，从而报错（`html.jasmine.reporter.js` 是要依赖 `jasmine.js` 的），所以这里最好根据项目的实际情况，合理调整一下顺序。
