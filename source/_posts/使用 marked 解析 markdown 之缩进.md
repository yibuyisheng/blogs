---
title: 使用 marked 解析 markdown 之缩进
date: 2016-06-15T16:12:00.000Z
tags:
- markdown
- ETPL
---

在前面一篇文章{% post_link 使用marked解析markdown %}中，大致介绍了一下 marked 使用过程中的一些问题，今天又再次遇到 ETPL 的 markdown 过滤器嵌套带来的问题。

<!-- more -->

# 遇见问题

这次，我想在 table 的 td 里面写 markdown ，期望效果看起来像是这样的：

{% img /images/14.png %}

而 markdown 代码，我是这样写的：

{% img /images/15.png %}

然后出来的效果是这样：

{% img /images/16.png %}

注意黑色的那段代码块，没缩进了！

什么情况？为啥会没缩进呢？

# 初步分析

仔细一看 markdown 代码，发现里面出现了过滤器嵌套，也就是说，里面那块 markdown 代码会被处理两次！

# 尝试解决方案1

既然处理了两次，那么就得想办法只处理一次，于是将 markdown 代码改成这样：

{% img /images/17.png %}

看起来每个 markdown 块都只被处理了一次，应该可以了吧！

于是，我得到了这个效果：

{% img /images/14.png %}

这个看起来好像没啥问题了。

但是，结合 filter 代码：

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

发现：第三个 &lt;!-- filter: markdown() --&gt; 会导致自己的 markdown 块缩进出问题。

# 尝试解决方案2

再来仔细玩味一下内嵌 filter 的处理流程吧，希望能找到解决方案。

经过各种 debug ，发现整个处理流程是这样的：

- 1、先处理最里面的 markdown 块（这是是 ETPL 的处理流程），然后生成对应的 HTML 代码，替换掉之前的 markdown 代码；
- 2、再处理外层的 markdown 块，这个块包含了第一步中生成的 HTML 代码块。于是在替换每行空格的时候，同样会替换掉第一步中生成的 code 标签中每一行前面相应的空格。

好了，现在为啥缩进会出问题的原因已经具体定位了，咋办呢？

在第2步调用 marked 解析之前，完全可以把第一步中生成的 HTML 代码拿出来，这样第2步处理的时候就不会去掉 code 块中的有用空格了。这样一来，过滤器关键部分的代码就变成了：

```js
var renderer = new marked.Renderer();
require('etpl').addFilter('markdown', function (source, useExtra) {
    // 把内嵌的 markdown 拿出来，防止多次转换
    var nestMarkdowns = [];
    source = source.replace(/<div class="markdown">(.|\n)*<\/div>/g, function (match) {
        nestMarkdowns.push(match);
        return '${nestMarkdown}';
    });

    source = source.replace(/^\n+/, '');
    var uselessSpaceCount = source.match(/^\s*/)[0].length;
    source = source.replace(new RegExp('^ {' + uselessSpaceCount + '}', 'gm'), '');
    return '<div class="markdown">'
        + marked(source, {renderer: renderer})
            .replace(/\${nestMarkdown}/g, function () {
                return nestMarkdowns.shift();
            })
        + '</div>';
});
```

刷一下页面，再看，符合预期，完全正常！
