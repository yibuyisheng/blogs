<!-- config.time: 2014-10-22 22:13 -->
<!-- config.brief: 对于如上代码，包含原理如下：1、首先 jsvm 只会执行一个线程；2、当这个线程遇到 `setTimout()` 的时候，就会将这个 function 放到某个队列里面；3、当前这个线程空闲的时候，就会执行任务队列轮询的代码，将满足条件的函数拿出来执行。 -->

# 一些 core javascript 的基础知识

### 一、 setTimeout

```js
setTimtout(function(){
   alert(2);                           // 后弹出
},0);
alert(1);                              // 先弹出
```

对于如上代码，包含原理如下：

* 1、首先 jsvm 只会执行一个线程；
* 2、当这个线程遇到 `setTimout()` 的时候，就会将这个 function 放到某个队列里面；
* 3、当前这个线程空闲的时候，就会执行任务队列轮询的代码，将满足条件的函数拿出来执行。

比较简单典型的一个应用场景就是：

```js
$(elem).html(xxxxxx);

setTimeout(function() {
  // 内部DOM操作很复杂，此处setTimeout用于保证在内部DOM操作结束并且相关内存被释放掉后执行后续代码
}, 0);
```

### 二、 eval

js 中除了全局作用域和函数作用域之外，还存在一个 eval 作用域。

eval 函数执行的时候，会根据当前执行上下文创建一个作用域。

此处有如下代码：

```js
function a() {
  var b = new SomeThing();
  return function() {
    eval('');
  };
}
```

### 三、预编译

先分别上如下几个片段的代码：

```html
<html>
<head>
<script>
a();
function a(){
  alert(1);
}
</script>
</head>
<body></body>
</html>
```

```html
<html>
<head>
<script>
a();
</script>

<script>
function a(){
  alert(1);
}
</script>
</head>
<body></body>
</html>
```

```html
<html>
<head>
<script>
a();
var b = function a(){
  alert(1);
}
</script>
</head>
<body></body>
</html>
```

执行结果分别是：

* 第一段代码：弹出1；
* 第二段代码：第一个script片段报错，a不存在；
* 第三段代码：报错，a不存在；

原因：

* 第一段代码中，jsvm会预编译，构造好a函数，所以访问a函数的顺序是不重要的；
* 第二段代码中，预编译是会分代码块执行的，每个script都会形成一个代码块，即便script是通过src引入js的；
* 第三段代码中，a函数的定义由于放在了一个表达式当中，因此jsvm不会预编译。

但是，此处还可以继续深入，第三段代码改成如下所示：

```html
<html>
<head>
<script>
var b = function a(){
  alert(1);
}
a();
</script>
</head>
<body></body>
</html>
```

这段代码也同样会报错， a 不存在。为什么呢？原因就是 a 函数放在了表达式当中， jsvm 会把 a 函数看作一个匿名函数，因此在当前语句执行完， a 就被释放掉了。

但是，请注意，上面讨论的都是根据 w3c 标准得出的结果，在第三段和第四段代码中，IE 6、7、8还是会预编译的，并且不会释放掉a，因此不会报错。

### 四、自执行函数

自执行函数的几种形式：

```js
(function() {})();
(function() {}());
!function(){}();
void function(){}();
```

其中第三种写法会造成额外的运算，因为要对返回的内容做“非”操作。

### 五、预编译中的变量声明

如下代码：

```js
function a(x){
  return x*2;
}
var a;
alert(a);
```

`var a` 只是声明，并不会干啥， `var a` 只会让当前作用域的 `alert(a)` 不会报 a 不存在的错误， a 实际上是什么，需要显示赋值；如果 `var a` 之前已经存在 a 了，则啥也不干。

### 六、 function 传参

如下代码：

```js
function fn1(a, b, c){
   a = 1.2;
   b = 2.2;
   c.c = 3.2;
}

var a = 1;
var b = 2;
var c = {c:3};

fn1(a,b,c);

alert(a);
alert(b);
alert(c.c);
```

原理不难理解，注意值类型和引用类型的区别。

### 七、作用域链

有如下几点：

* 1、作用域链是在定义的时候就确定下来了的；
* 2、隐式对象模型：对于一个作用域， jsvm 会创建一个隐式对象，然后在这个对象上面绑定当前作用域的各种变量。多个函数的嵌套定义也就会形成一条作用域链了。如果在某个作用域中要访问一个 a 变量，则会首先在当前作用域中查找是否存在 a 变量，如果不存在，则向上找父作用域隐式对象中是否存在 a 变量，依次类推，如果到了根作用域还找不到 a 变量的话，就会报错了。

### 八、类数组结构

第一个问题，如何构造类数组结构？思路简单，不赘述。

jquery 选择器构造出来的就是一个类数组结构。

### 九、工厂模式

```js
function factory() {
  return new ThisIsAClass();
}
```
