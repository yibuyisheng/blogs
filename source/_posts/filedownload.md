---
title: WEB 中的文件下载
date: 2016-06-17 8:59
tags:
- HTTP
---

在 WEB 开发中，我们会期望用户在点击某个链接的时候，下载一个文件（不管这个文件能不能被浏览器解析，都要下载）。以前接触过一种方式，就是在响应 header 中设置 `force-download` ：

```
Content-Type: application/force-download
Content-Disposition: attachment; filename="test.zip"
```

然而，这是一种 hack 方式，并不推荐使用：
<!-- more -->

{% blockquote Quentin http://stackoverflow.com/a/10616753/3468416 Utility of HTTP header “Content-Type: application/force-download” for mobile? %}
Content-Type: application/force-download means "I, the web server, am going to lie to you (the browser) about what this file is so that you will not treat it as a PDF/Word Document/MP3/whatever and prompt the user to save the mysterious file to disk instead". It is a dirty hack that breaks horribly when the client doesn't do "save to disk".
{% endblockquote %}

有位小伙伴就遇到了不奏效的情况：

{% blockquote Jörg Wagner http://www.digiblog.de/2011/04/android-and-the-download-file-headers/ Android and the HTTP download file headers%}
ATTENTION:
If you use any of the lines below your download will probably NOT WORK on Android 2.1.
<br>

Content-Type: application/force-download
Content-Disposition: attachment; filename=MyFileName.ZIP
Content-Disposition: attachment; filename="MyFileName.zip"
Content-Disposition: attachment; filename="MyFileName.ZIP";
{% endblockquote %}

那么，究竟怎么办呢？接下来描述我的同事和我遇到的问题。

# 问题发现

最近接手了一个新项目，今天刚好有空熟悉一下之前的功能。于是打开线上地址，输入测试账号，进入一个列表页面，这个列表页面提供了下载数据为 Excel 文件的功能，点了一下`下载`链接，猛然发现，下载的文件名字怎么是 `download` ？为啥呢？

我用的浏览器是 Chrome 51 ，系统是 OS EI Capitan 10.11.5 。

我一同事 Chrome 47，可以完全正常下载！

先看看为啥我的浏览器不行吧！

# 第一步探索

打开 Chrome 开发者工具，查看 HTTP 请求，发现响应头部有如下两项：

```
Content-Type: application/octet-stream;charset=GBK
Content-Disposition: attachment; filename="%D6%D0%CE%C4.xlsx
```

噢，filename 那里多了一个双引号，去掉吧！

# 第二步探索

然而，引号去掉之后，问题依旧！什么情况？难道是 filename 需要引号包起来？

好吧，包起来试试！

# 第三步探索

包起来后问题依旧，什么鬼？

灵机一动，去看看别人怎么做的吧！于是找到别人网站一个下载 Excel 的页面，点击下载，发现响应 header 里面是这样的：

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8
Content-Disposition: inline;filename="%D6%D0%CE%C4.xlsx";filename*=utf-8''%D6%D0%CE%C4.xlsx
```

Content-Type 指明了具体的文件类型，然后 Content-Disposition 多了一个 `filename*=` ，这是什么东西？ `utf-8` 是什么编码？

经过一堆胡乱搜索，猜测 utf-8 就是文件名的编码。为啥文件名要编码呢？呃，HTTP header 里面还未见过中文……

好了，我们后端的代码大致做法是这样的：

```java
response.addHeader("Content-Type", "application/octet-stream");
response.addHeader("attachment; filename=\"" + new String(fileName.getBytes("GBK"), "ISO-8859-1") + "\".xlsx");
```

看起来，只需要用 `filename*=` 附上编码就行了，于是后端代码改成：

```java
response.addHeader("Content-Type", "application/octet-stream");
response.addHeader("attachment; filename=\"" + new String(fileName.getBytes("GBK"), "ISO-8859-1") + "\".xlsx;filename*=GBK''" + new String(fileName.getBytes("GBK"), "ISO-8859-1"));
```

好了，我再点击下载，没问题！

# 第四步探索

看起来好像是 OK 了，但是，用 IE 试一下，又不正常了，文件名字不对了！

为什么呢？别人网站在 IE 下都能正常下载的！现在主要有两处区别：

- 我们的 Content-Type 没有写具体；
- 我们使用了 GBK 编码。

一思索，感觉编码的嫌疑较大，为啥呢？因为对于文件下载，浏览器根本不用管文件内容是个啥，只需要按照二进制流写入本地磁盘就好了，并且，此处也只是文件名错了，下载下来的文件内容还是没问题的。

那就改编码吧，改成 UTF-8 ：

```java
response.addHeader("Content-Type", "application/octet-stream");
response.addHeader("attachment; filename=\"" + new String(fileName.getBytes("UTF-8"), "ISO-8859-1") + "\".xlsx;filename*=UTF-8''" + new String(fileName.getBytes("UTF-8"), "ISO-8859-1"));
```

经测试，一切正常！

# 总结

在文件下载功能中，一般都会借助于这两个 header 来达到效果，那么两个 header 的具体作用是什么呢？

- Content-Type：告诉浏览器当前的响应体是个什么类型的数据。当其为 application/octet-stream 的时候，就说明 body 里面是一堆不知道是啥的二进制数据。
- Content-Disposition：用于向浏览器提供一些关于如何处理响应内容的额外的信息，同时也可以附带一些其它数据，比如在保存响应体到本地的时候应该使用什么样的文件名。

细想一下， Content-Type 好像对于文件下载没什么作用？事实上的确如此。可是再想一下，如果浏览器不理会 Content-Disposition ，不下载文件怎么办？如果此时提供了 Content-Type ,至少浏览器还有机会根据具体的 Content-Type 对响应体进行处理。

可是为什么浏览器会不理会 Content-Disposition 呢？因为这个 Content-Disposition 头部并不是 HTTP 标准中的内容，只是被浏览器广泛实现的一个 header 而已。

话题转一转， Content-Disposition 的语法见[此处](https://tools.ietf.org/html/rfc6266#section-4.1)，其中相对重要的点此处罗列一下：

- 常用的 disponsition-type 有 `inline` 和 `attachment` ：
    - inline：建议浏览器使用默认的行为处理响应体。
    - attachment：建议浏览器将响应体保存到本地，而不是正常处理响应体。
- Content-Disposition 中可以传入 filename 参数，有两种形式：
    - filename=yourfilename.suffix：直接指明文件名和后缀。
    - filename*=utf-8''yourfilename.suffix：指定了文件名编码。其中，编码后面那对单引号中还可以填入内容，此处不赘述，可参考[规范](https://tools.ietf.org/html/rfc6266)。
    - 有些浏览器不认识 `filename*=utf-8''yourfilename.suffix` （估计因为这东西比较复杂），所以最好带上 `filename=yourfilename.suffix` 。
