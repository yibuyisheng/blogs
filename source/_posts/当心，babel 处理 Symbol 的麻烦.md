---
title: 当心，babel 处理 Symbol 的麻烦
date: 2016-12-28 22:29
tags:
- JavaScript
- babel
---

在使用 babel 转换 ES next 代码的时候，并不会将 Symbol 直接转换成 ES5 中对应的内容，需要引入额外的 polyfill 才能正常工作。
<!-- more -->

有的团队为了避免引入这个额外的 polyfill ，会选择不使用 Symbol ，包括通过 babel 生成 Symbol 的特性（比如 `for of` 等）。

这时候就会有个比较隐蔽的地方需要注意，就是尽量不要让 babel 生成这样的代码：

```js
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
```

这个里面包含了一个 `Symbol` ，为了让 `Symbol` 不至于报错，又要想办法在全局先声明一下 `Symbol` 变量，比较丑陋。

目前在实践中，发现这样的 ES next 代码会生成上述代码：

```js
function fn1() {
    if (1) {
        let a = 1;
        filter(function fn() {
            console.log(a);
        });
        return;
    }
}
```

生成的代码为：

```js
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function fn1() {
    if (1) {
        var _ret = function () {
            var a = 1;
            filter(function fn() {
                console.log(a);
            });
            return {
                v: void 0
            };
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    }
}
```

这段代码有什么特征呢？就是在 `if` 块中定义了函数，函数中访问了 `if` 块中的“块级变量”，并且 `if` 块使用了 `return` 语句。

可以看出，babel 为了保证 `if` 块内变量的作用域，会套一个匿名函数，同时由于 `if` 块中存在 `return` 返回，所以就用 `_ret` 来接收匿名函数的返回值。然后后面为啥会生成那串长长的对 `_ret` 的类型判断代码，目前还不太清楚，可能要结合 babel 的内部处理逻辑去看了，单从生成的代码看，这个完全是多余的。

推而广之， `for` 块等局部非函数作用域都会有类似的问题。

实际上，从代码编写规范角度来看，是不应该在这种局部作用域块里面定义函数的。函数应该是一段通用的代码，不应该缩在那一小块里面。
