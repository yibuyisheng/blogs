<!-- config.time: 2015-08-27 -->

# CSS border-radius

`border-radius` 的取值：

> [ &lt;length&gt; | &lt;percentage&gt; ]{1,4} [ / [ &lt;length&gt; | &lt;percentage&gt; ]{1,4} ]?

<style>
.demo1 {
    width: 100px;
    height: 100px;
    background: lightblue;

    border-radius: 20px/5px;
}
</style>

<div class="demo1"></div>

上述示例的 CSS 代码为：

border-radius 是可以通过`/`的形式来对某一个角设置一个椭圆弧的。

比如示例中的 `20px/5px` 的含义是：对于左上角的圆弧，圆心到上边框的距离是5px，到左边框的距离是20px；对于右上角的圆弧，圆心到上边框的距离是5px，到右边框的距离是20px；对于右下角的圆弧，圆心到下边框的距离是5px，到右边框的距离是20px；对于左下角的圆弧，圆心到下边框的距离是5px，到左边框的距离是20px。

如果 border-radius 的半径小于或等于元素的边框厚度时，边框内角就会变成直角效果。

对 img 元素运用 border-radius ， webkit 内核不能使图片边角出现圆角的效果，可以使用背景图片的方式来修正这个问题。

当表格样式属性 border-collapse 是 collapse 时，对表格使用 border-radius 圆角效果，表格将不会展现出圆角效果，只有 border-collapse 为 separate 的时候，圆角才能正常展示。

border-radius 可以做的效果：圆形、半圆、扇形、椭圆。

<div class="demo" name="half ellipse.html"></div>