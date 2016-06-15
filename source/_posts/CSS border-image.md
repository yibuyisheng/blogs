---
title: CSS border-image
date: 2015-08-27
tags:
- CSS
---

{% iframe ../demos/border-image.html 100% 336 %}

上面示例的 css 代码为：
<!-- more -->

```css
.demo1 {
    display: inline-block;
    width: 400px;
    height: 200px;

    border-width: 60px 70px;
    border-image: url(../images/8.jpg) 60 70 round stretch;
}
```

CSS 中的 border-image 可以给边框设置图片背景，其参数主要分为三部分：

* 1、图片来源。即示例中的 `url(../images/8.jpg)` ；
* 2、图片裁剪尺寸。即示例中的 `60 70`。裁剪尺寸遵循 `top-right-bottom-left` 规则，其数值可以是百分数，也可以是像素值。如果是像素值，则不能带单位，直接写数值就好了，示例中`60 70`的含义为：对图片实施裁剪，图片上部和下部分别裁掉60px，左部和右部分别裁掉70px，于是图片就形成9块，四个边角块是无法运用round（平铺）等效果的，中间那一块是没用的。如果为百分数，则是根据图片的尺寸来计算出相应的像素值的；
* 3、图片可运用效果区域的展示效果。取值为 [round|repeat|stretch] 。正如2中所述，图片会被裁剪成9块，而这个展示效果只能运用于上、右、下、左的中间那一块。

`-webkit-border-image` 是有 bug 的，它会用裁剪后的9块图片的中间那一张覆盖掉背景。如下所示：

{% iframe ../demos/-webkit-border-image.html 100% 336 %}
