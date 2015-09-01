<!-- config.time: 2015-09-01 -->

# CSS 变形

## 2D

2D 常用的变形函数： tranlate() 、 scale() 、 rotate() 、 skew() 、 matrix() 。

### skew() 函数

示例：

<style type="text/css">
.demo3 {
    width: 500px;
    height: 300px;
    position: relative;
}
.demo3 .box1, .demo3 .box2, .demo3 .box3, .demo3 .box4 {
    top: 100px;
    left: 50px;
    position: absolute;
    width: 100px;
    height: 100px;
}

.demo3 .box1 {
    border: 1px #000 dotted;
}
.demo3 .box2 {
    border: 1px solid #000;
    transform: skewX(45deg);
}

.demo3 .box3, .demo3 .box4 {
    left: 240px;
}
.demo3 .box3 {
    border: 1px dotted #000;
}
.demo3 .box4 {
    border: 1px solid #000;
    transform: skewY(45deg);
}

.demo3 h5 {
    position: absolute;
    margin: 0;
    top: 20px;
}
.demo3 h5:first-child {
    left: 24px;
}
.demo3 h5:nth-child(4) {
    left: 246px;
}
</style>

<div class="demo3">
    <h5>skewX(45deg)</h5>
    <div class="box1"></div>
    <div class="box2"></div>
    <h5>skewY(45deg)</h5>
    <div class="box3"></div>
    <div class="box4"></div>
</div>

下图描述了`skew(30deg, 10deg)`的工作原理：

![](./imgs/10.jpg)

> **注：**上图来自 [http://dtop.powereasy.net/Item/3715.aspx](http://dtop.powereasy.net/Item/3715.aspx) 。

### transform-origin

transform-origin 用来指定元素变形的中心点位置，默认就是元素的中心点。

但是，对于位移 translate() 函数来说，无论 transform-origin 如何改变，都是以元素中心点为基准进行位移，例如：

<style type="text/css">
.demo1 {
    width: 200px;
    height: 200px;
    position: relative;
}
.demo1 .box1, .demo1 .box2 {
    top: 25px;
    width: 100px;
    height: 100px;
    position: absolute;
}
.demo1 .box1 {
    border: 1px dotted #000;
}
.demo1 .box2 {
    border: 1px solid #000;
    transform: translate(40px, 40px);
    transform-origin: 50% 50%;
}
</style>

<div class="demo1">
    <h5>示例1</h5>
    <div class="box1"></div>
    <div class="box2"></div>
</div>

<style type="text/css">
.demo2 {
    width: 200px;
    height: 200px;
    position: relative;
}
.demo2 .box1, .demo2 .box2 {
    top: 25px;
    width: 100px;
    height: 100px;
    position: absolute;
}
.demo2 .box1 {
    border: 1px dotted #000;
}
.demo2 .box2 {
    border: 1px solid #000;
    transform: translate(40px, 40px);
    transform-origin: 100% 100%;
}
</style>

<div class="demo2">
    <h5>示例2</h5>
    <div class="box1"></div>
    <div class="box2"></div>
</div>

`示例1`和`示例2`中的虚线框是元素的原始位置，实线框是位移之后的位置。`示例1`的 transform-origin 是`50% 50%`，而`示例2`是`100% 100%`，但是从最终偏移效果来看，两者的结果是一样的，所以 tranform-origin 对 translate() 函数并没有影响。

## 3D

3D 常用变形函数： translate3d() 、 translate() 、 scale3d() 、 scaleZ() 、 rotate3d() 、 rotateX() 、 rotateY() 、 rotateZ() 、 perspective() 、 matrix3d() 。

### transform-style

transform-style 的取值为 `flat` 或者 `preserve-3d` 。下面的例子展示了两者的差别：

<style>
.demo4 {
    position: relative;
    width: 200px;
    height: 200px;
    perspective: 200px;
}
.demo4 .container1,
.demo4 .container1-origin {
    position: absolute;
    width: 100px;
    height: 100px;
}

.demo4 .container1-origin, .demo4 .container1 {
    left: 40px;
    top: 40px;
}
.demo4 .container1-origin {
    border: 1px dotted #000;
}
.demo4 .container1 {
    border: 1px solid #000;
    transform: rotateY(40deg);
    transform-style: flat;
}
.demo4 .container1 .box {
    border: 1px solid #f00;
    width: 50px;
    height: 50px;
    transform: rotateY(40deg);
}
</style>

<div class="demo4">
    <div class="container1-origin">
        <div class="box"></div>
    </div>
    <div class="container1">
        <div class="box"></div>
    </div>
</div>

<style>
.demo5 {
    position: relative;
    width: 200px;
    height: 200px;
    perspective: 200px;
}
.demo5 .container1,
.demo5 .container1-origin {
    position: absolute;
    width: 100px;
    height: 100px;
}
.demo5 .container1-origin, .demo5 .container1 {
    left: 40px;
    top: 40px;
}
.demo5 .container1-origin {
    border: 1px dotted #000;
}
.demo5 .container1 {
    border: 1px solid #000;
    transform: rotateY(40deg);
    transform-style: preserve-3d;
}
.demo5 .container1 .box {
    border: 1px solid #f00;
    width: 50px;
    height: 50px;
    transform: rotateY(40deg);
}
</style>

<div class="demo5">
    <div class="container1-origin">
        <div class="box"></div>
    </div>
    <div class="container1">
        <div class="box"></div>
    </div>
</div>

从示例中可以看出， `preserve-3d` 会让子元素在父元素变形的基础上继续变形，而 `flat` 则会消除父元素变形对子元素变形带来的影响。

**理解：**

对于第一种 `div.container1` 元素的 transform-style 为 `flat` 的情形，表明其所有子元素在 2D 空间中呈现，于是相对于 2D 平面（就可以理解为显示器的那个平面）做变形；对于第二种 `div.container1` 元素的 transform-style 为 `preserve-3d` 的情形，表明其所有子元素在 3D 空间中呈现，于是相对于当前 `div.container1` 为基准的平面做变形。
