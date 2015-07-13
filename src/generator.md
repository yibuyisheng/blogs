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

# 一个简单的类似于 tj co 库的东西

TODO
