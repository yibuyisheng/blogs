---
title: 使用 marked 解析 markdown
date: 2016-05-20 13:49:00
---

[marked](https://github.com/chjj/marked) 是一个解析 markdown 的 JavaScript 库，可以运行在 Node 环境或者浏览器环境。

最简单直接的一种使用方式：

```js
var marked = require('marked');
console.log(marked('I am using __markdown__.'));
// Outputs: <p>I am using <strong>markdown</strong>.</p>
```
<!-- more -->

marked 库主要提供了一个 marked 函数，该函数声明为：

```
type OptionsType = {
    highlight: (function(code: string, lang: string, callback: function(err: Error, code: string)))=,
    renderer: marked.Renderer=,
    gfm: boolean=,
    tables: boolean=,
    breaks: boolean=,
    pedantic: boolean=,
    sanitize: boolean=,
    smartLists: boolean=
};
marked(markdownString: string, options: OptionsType=, callback: Function=): string;
```

其中，marked 可以通过 renderer 配置提供了自定义解析途径。

renderer 配置对应的是一个 marked.Renderer 类，此类主要包含了如下的钩子方法：

- code(string code, string language)
- blockquote(string quote)
- html(string html)
- heading(string text, number level)
- hr()
- list(string body, boolean ordered)
- listitem(string text)
- paragraph(string text)
- table(string header, string body)
- tablerow(string content)
- tablecell(string content, object flags)
- strong(string text)
- em(string text)
- codespan(string code)
- br()
- del(string text)
- link(string href, string title, string text)
- image(string href, string title, string text)

所有的这些方法，都可以在 renderer 实例上面覆盖掉。marked 在解析到 markdown 标记的时候，都会去调用相应的钩子方法，而钩子方法的返回结果，就会是该标记最终的解析结果。这样一来，就生成了自定义的解析结果。

marked 还有一个重要的配置：highlight，可以对代码块进行解析，配合相应的 css ，达到语法高亮效果。

以上就是 marked 最基本最核心的用法了。

其实本文的重点是记录在使用过程中遇到的一些坑，下面进入重点。

## markdown 缩进问题

在 markdown 的语法中，标题下面（换行之后）标记是不能缩进的，而列表项下面的标记是可以缩进的。

现在前端开发，经常会使用一些模板引擎，比如 [ETPL](https://github.com/ecomfe/etpl) ，这些模板，一般都会提供过滤器的功能。以 ETPL 为例，可以在 js 代码中这样添加一个过滤器：

```js
var etpl = require('etpl');
var marked = require('marked');
etpl.addFilter('markdown', function (source, useExtra) {
    return marked(source);
});
```

此时在对应的模板中，就可以使用该过滤器了：

```html
<div>
    <!-- filter: markdown() -->
    ### 标题

    内容
    <!-- /filter -->
</div>
```

此时，解析出来的样子会让人瞠目结舌：过滤器里面的 markdown 标记根本不会被解析掉，整个 markdown 标记块会被当成代码块。

为什么会这样呢？

如果打印一下 markdown 过滤器处理函数中的 source 参数：

```js
var etpl = require('etpl');
var marked = require('marked');
etpl.addFilter('markdown', function (source, useExtra) {
    console.log(source);
    return marked(source);
});
```

可以发现，打印出来的内容会是这个样子：

```
"
    ### 标题

    内容
    "
```

第一行没啥内容，第二行并没有顶行，而是有缩进的，然后最后一行没实际内容，只有一个缩进。

这明显跟 markdown 语法有冲突，必须要进行如下处理：

* 1、第一行和最后一行没啥实际内容，可以去掉；
* 2、检测第一行前面的缩进空格数（这里假定缩进用的是空格），记录下来，假设为 `n` ；
* 3、将每一行前面的 `n` 个空格去掉。

具体的代码实现如下：

```js
var etpl = require('etpl');
var marked = require('marked');
etpl.addFilter('markdown', function (source, useExtra) {
    source = source.replace(/(^\n+|\n+$)/g, '');
    var uselessSpaceCount = source.match(/^\s*/)[0].length;
    source = source.replace(new RegExp('^ {' + uselessSpaceCount + '}', 'gm'), '');
    return marked(source);
});
```

## HTML 标签

有的时候，可能想给 markdown 标记的某一块加上背景色，比如：

```html
<!-- filter: markdown() -->
<div class="background-red">
### 标题

内容
</div>
<!-- /filter -->
```

这样写又会崩溃了， div 内部的 markdown 标记并不会被解析！

解决方法就是把 div 放过滤器外边吧：

```html
<div class="background-red">
<!-- filter: markdown() -->
### 标题

内容
<!-- /filter -->
</div>
```
