---
title: CSS 语法速查
date: 2015-09-03 19:06
---

<!-- more -->
### [background](http://www.w3.org/TR/css3-background/)

```
[ <bg-layer> , ]* <final-bg-layer>

    <bg-layer> = <bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box> || <box>
    <final-bg-layer> = <bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box> || <box> || <'background-color'>

        <bg-image> = <image> | none
```

[&lt;image&gt;](http://www.w3.org/TR/css3-background/#ltimagegt)
[&lt;position&gt;](http://www.w3.org/TR/css3-background/#ltpositiongt)
[&lt;bg-size&gt;](http://www.w3.org/TR/css3-background/#ltbg-sizegt)
[&lt;repeat-style&gt;](http://www.w3.org/TR/css3-background/#ltrepeat-stylegt)
[&lt;attachment&gt;](http://www.w3.org/TR/css3-background/#ltattachmentgt)
[&lt;box&gt;](http://www.w3.org/TR/css3-background/#ltboxgt)

### [radial-gradient()](http://www.w3.org/TR/2012/CR-css3-images-20120417/#radial-gradients)

```
<radial-gradient> = radial-gradient(
  [ [ <shape> || <size> ] [ at <position> ]? , |
    at <position>, 
  ]?
  <color-stop> [ , <color-stop> ]+
)

    <shape> = circle || ellipse
```