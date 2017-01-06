---
title: ES6 中的模式匹配和默认参数
date: 2017-01-06
tags:
- JavaScript
- ECMAScript 6
---

ES6 中，引入了其他很多语言都具备的`模式匹配`和`默认参数`语法糖，使得代码简洁了不少。但是使用的时候还是有些细节需要注意。
<!-- more -->

## 模式匹配原理

### 模式匹配的种类

具体来说，有三种类型的模式匹配：

* 直接赋值

    ```js
    let a = 1;
    ```

* 对象模式

    ```js
    let {name, age: age} = {name: 'yibuyisheng', age: 25};
    ```

* 数组模式

    ```js
    let [a, b] = [1, 2];
    ```

### 模式匹配的过程

* 直接赋值：x ← value（包括 `undefined` 和 `null`）

    ```js
    x = value
    ```

* 对象模式

    该种模式下，会检查匹配源是不是对象，如果不是对象，则会使用内部的 [ToObject()](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject) 进行转换。

    - {«properties»} ← undefined

        ```js
        throw new TypeError();
        ```

    - {«properties»} ← null

        ```js
        throw new TypeError();
        ```

    - {key: «pattern», «properties»} ← obj

        ```
        «pattern» ← obj.key
        {«properties»} ← obj
        ```

    - {key: «pattern» = default_value, «properties»} ← obj

        ```
        let tmp = obj.key;
        if (tmp !== undefined) {
          «pattern» ← tmp
        } else {
          «pattern» ← default_value
        }
        {«properties»} ← obj
        ```

    - {} ← obj

        ```
        // No properties left, nothing to do
        ```

* 数组模式

    该种模式下，右侧必须是可迭代的，如果不可迭代，就会抛出错误。

    - [«elements»] ← non_iterable

        ```
        assert(!isIterable(non_iterable))
        throw new TypeError();
        ```

    - [«elements»] ← iterable

        ```
        assert(isIterable(iterable))
        let iterator = iterable[Symbol.iterator]();
        «elements» ← iterator
        ```

## 模式匹配中需要注意的

### undefined 触发默认值

如下所示：

```js
let [x = 1] = [undefined]; // x = 1
```

右侧的 `underfined` 元素会触发左侧的默认值。

### 在需要的时候才会去计算默认值

比如：

```js
let {prop: y = someFunc()} = someValue;
```

只有在右侧 `someValue.prop` 为 `undefined` 的时候才会执行 `someFunc()` 函数。

### 模式匹配中可以引用模式中前面的变量

比如：

```js
let [x = 3, y = x] = [7, 2]; // x=7; y=2
```

这个地方要注意顺序，比如下面这个就是错误的：

```js
let [x = y, y = 3] = [7, 2]; // ReferenceError
```

## 函数参数传递

函数传参的过程，实际上就包含了模式匹配的过程：

```
function func(«FORMAL_PARAMETERS») {
    «CODE»
}
func(«ACTUAL_PARAMETERS»);

// 大致是：

{
    let [«FORMAL_PARAMETERS»] = [«ACTUAL_PARAMETERS»];
    {
        «CODE»
    }
}
```

## 函数默认参数，慎用对象引用

有如下示例代码：

```js
let list = [];
function fn(a = list) {
    console.log(a);
}

fn(); // console.log: []
list.push(1);
fn(); // console.log: [1]
```

默认参数使用了 list 引用，那么后续对 list 的修改，都会体现到默认参数上面去。在大型项目开发中，容易失控。如果一定要用某个变量生成默认值，建议深拷贝一份：

```js
let list = [];
const listDefaultParam = deepClone(list); // 其它地方不要再使用这个变量了，并且在函数内部也不要修改这个变量值
function fn(a = listDefaultParam) {
    console.log(a);
}
```

## 默认参数的作用域

使用最新版的 Chrome 浏览器执行下面的代码，注意输出结果：

```js
({
    method() {
        function innerFn(a = () => console.log(this)) {
            a();
        }
        innerFn.call(this);
    }
}).method();

({
    method() {
        function innerFn(a = () => console.log(this)) {
            a();
        }
        innerFn();
    }
}).method();

({
    method() {
        let arrowFn = () => console.log(this);
        function innerFn(a = arrowFn) {
            a();
        }
        innerFn();
    }
}).method();

({
    method() {
        let arrowFn = () => console.log(this);
        function innerFn(a = arrowFn) {
            a();
        }
        innerFn.call(this);
    }
}).method();

// output:
//
// Object({method: ()})
// Window { ... }
// Object({method: ()})
// Object({method: ()})
```

实际上，将上述代码用 babel 转换一下，可以发现默认参数的处理过程发生在函数开始部分。
