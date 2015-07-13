# 什么是 generator ？

可以暂停（ pause ）和唤醒（ resume ）的函数。

# 实现一个迭代器

```js
function* gen() {
    for (let a of [1, 2, 3]) {
        yield a + 1;
    }

    return 5;
}

// 下面的 for 循环输出：
// 2
// 3
// 4
for (let b of gen()) {
    print(JSON.stringify(b));
}

let it = gen();
print(JSON.stringify(it.next())); // 输出： {value: 2, done: false}
print(JSON.stringify(it.next())); // 输出： {value: 3, done: false}
print(JSON.stringify(it.next())); // 输出： {value: 4, done: false}
print(JSON.stringify(it.next())); // 输出： {value: 5, done: true}

print(JSON.stringify([...gen()])); // 输出： [2, 3, 4]
```

# 创建 generator 的方式

```js
// 第一种
function* genFunc() { ··· }
let genObj = genFunc();

// 第二种
const genFunc = function* () { ··· };
let genObj = genFunc();

// 第三种
let obj = {
    * generatorMethod() {
        ···
    }
};
let genObj = obj.generatorMethod();

// 第四种
class MyClass {
    * generatorMethod() {
        ···
    }
}
let myInst = new MyClass();
let genObj = myInst.generatorMethod();
```

# generator 嵌套： yield*

```js
function* gen1() {
    yield 2;
    yield 3;
    return 'result of gen1';
}
function* gen2() {
    yield 1;

    // `yield* gen1()` 类似于
    // for (let x of gen1()) {
    //      yield x;
    // }
    print(JSON.stringify(yield* gen1()));

    yield 4;
}
// 输出：
// 'result of gen1'
// [1, 2, 3, 4]
print(JSON.stringify([...gen2()]));

function* gen3() {
    yield 1;
    yield* [2, 3];
    yield 4;
}
print(JSON.stringify([...gen3()])); // 输出： [1, 2, 3, 4]
```

# next 传值

```js
function* gen1() {
    print(JSON.stringify(yield));
}
let it = gen1();
// 输出：
// {value: undefined, done: false}
// outer value
// {value: undefined, done: true}
print(JSON.stringify(it.next()));
print(JSON.stringify(it.next('outer value')));
```

# `return()` 外部终止 generator

```js
function* gen1() {
    print('a');
    yield 1;
    print('b');
    yield 2;
    print('c');
}
// 输出：
// a
// {value: 1, done: false}
// {value: 'result', done: true}
let it = gen1();
print(JSON.stringify(it.next()));
print(JSON.stringify(it.return('result')));
```

# `throw()` 抛出异常

```js
function* gen() {
    try {
        print('Started');
        yield;
    } catch (error) {
        print('Caught: ' + error.message);
    }
    return 'return result';
}
// 输出：
// Started
// {value: undefined, done: false}
// Caught: error
// {value: 'return result', done: true}
let it = gen();
print(JSON.stringify(it.next()));
print(JSON.stringify(it.throw(new Error('error'))));
```

# 很有有趣也有用的例子

```js
// for 循环延迟执行
function* fn1(iterable) {
    for (let x of iterable) {
        if (x === 0) {
            continue;
        }
        yield x;
    }
}
function* fn2(iterable) {
    for (let x of iterable) {
        yield x + 1;
    }
}
function* fn3(iterable) {
    for (let x of iterable) {
        yield x / 2;
    }
}
let newArr = [...fn3(fn2(fn1([1, 2, 3])))];
print(JSON.stringify(newArr)); // [1, 1.5, 2]
```

# generator 类图

规范里面有一张[很大的图](http://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-objects)，有点复杂。所以，看一张小图：

![](https://github.com/yibuyisheng/blogs/blob/master/imgs/5.jpg)

说明：

* 空心箭头表示两个对象的继承关系。换句话说，从 x 指向 y 的箭头意味着 `Object.getPrototypeOf(x) === y` 。
* 圆括号表示当前被包起来的对象是存在的，但是不能通过全局变量来访问。
* 带有 `instanceof` 字眼的箭头如果从 x 指向 y ，就表明 `x instanceof y` 。
    * `o instanceof C` 实际上就相当于 `C.prototype.isPrototypeOf(o)`
* 带有 `prototype` 字眼的箭头如果从 x 指向 y ，就表明 `x.prototype === y` 。

此图看完可能没有直观的感受，看两个例子先。

第一个， generator 函数表现得很像一个构造函数，因为通过 `new` 调用和直接调用，两者的效果是一样的，都返回 generator 对象，如下所示：

```
> function* g() {}
> g.prototype.hello = function () { return 'hi!'};
> let obj = g();
> obj instanceof g
true
> obj.hello()
'hi!'
```

第二个，如果想给所有的 generator 对象添加一个方法，就可以放在 `(Generator).prototype` 上面，如下所示：

```
> let Generator_prototype = Object.getPrototypeOf(function* () {}).prototype;
> Generator_prototype.hello = function () { return 'hi!'};
> let generatorObject = (function* () {})();
> generatorObject.hello()
'hi!'
```

generator 内部的 `this` 是有一些猫腻的：

```js
function* gen1() {
    'use strict'; // just in case
    yield this;
}

// Retrieve the yielded value via destructuring
let [functionThis] = gen1();
console.log(functionThis); // undefined

let obj = { method: gen1 };
let [methodThis] = obj.method();
console.log(methodThis === obj); // true

function* gen2() {
    console.log(this); // ReferenceError
}
new gen2();
```

# 一个简单的类似于 tj co 库的东西

TODO
