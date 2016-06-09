---
title: 使用 CSS background 构造一个棋盘
date: 2015-08-25
---

[CSS background 的规范文档](http://www.w3.org/TR/css3-background)。

![](https://raw.githubusercontent.com/yibuyisheng/blogs/master/imgs/6.png)
<!-- more -->

使用的 CSS 代码如下：

```css
    div.demo1 {
        width: 300px;
        height: 150px;

        background-color: #eee;
        background-image:
            linear-gradient(45deg, #bbb 25%, transparent 0),
            linear-gradient(45deg, transparent 75%, #bbb 0),
            linear-gradient(45deg, #bbb 25%, transparent 0),
            linear-gradient(45deg, transparent 75%, #bbb 0);
        background-size: 30px 30px;
        background-position: 0 0, 15px 15px, 15px 15px, 0 0;
    }
```

整个 div 的背景色是 #eee 。

这个背景是由四幅代码“制造”的图片构成的，分别对应于四行 linear-gradient 。

第一幅图片，颜色渐变，角度是 45deg ，于是从图片的左下角开始往右上角渐变。0-25%的颜色是 #bbb ，25%-100%的颜色是透明的（ transparent ），图片的大小是30px*30px的，图片从坐标(0,0)处开始绘制。

第二幅图片，颜色渐变，角度是 45deg ，于是从图片的左下角开始往右上角渐变。0-75%的颜色是透明的（ transparent ），75%-100%的颜色是 #bbb ，图片的大小是30px*30px的，图片从坐标(15px,15px)处开始绘制。

第三幅图片，颜色渐变，角度是 45deg ，于是从图片的左下角开始往右上角渐变。0-25%的颜色是 #bbb ，25%-100%的颜色是透明的（ transparent ），图片的大小是30px*30px的，图片从坐标(15px,15px)处开始绘制。

第四幅图片，颜色渐变，角度是 45deg ，于是从图片的左下角开始往右上角渐变。0-75%的颜色是透明的（ transparent ），75%-100%的颜色是 #bbb ，图片的大小是30px*30px的，图片从坐标(0,0)处开始绘制。

为了更清晰的看到每幅图片代码对应的区域，参考一下一段代码及其效果：

```css
    div.demo2 {
        width: 300px;
        height: 150px;

        background-color: #eee;
        background-image:
            linear-gradient(45deg, red 25%, transparent 0),
            linear-gradient(45deg, transparent 75%, blue 0),
            linear-gradient(45deg, green 25%, transparent 0),
            linear-gradient(45deg, transparent 75%, orange 0);
        background-size: 30px 30px;
        background-position: 0 0, 15px 15px, 15px 15px, 0 0;
    }
```

![](https://raw.githubusercontent.com/yibuyisheng/blogs/master/imgs/7.png)

### 结语

css 的 background 属性现在很强大了，利用背景“图片”的层叠，可以做出很多绚丽的背景效果。

### 更多 CSS background 的效果：

{% iframe /demos/envelope.html 100% 250 %}

{% iframe /demos/css%20background.html 100% 430 %}

{% iframe /demos/marching%20ants%20borders.html 100% 240 %}
