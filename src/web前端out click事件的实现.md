<!-- config.time: 2014-10-22 14:52 -->
# web前端out click事件的实现

在web前端开发中，元素外部点击事件算是非常常用的一种事件了。比如弹出一个对话框，点击对话框外部的时候需要把这个对话框关掉。

实现这个事件有一个核心的东西，就是判断两个节点是否存在父子关系，整个事件流程如下：

* 1、事先设定好的一组元素，如果在这组元素外部点击的话，就会触发out click事件，这组元素暂记为nodes；
* 2、用户点击一个元素，可以从event.target中获取到当前用户点击的节点，暂记为nodeClick；
* 3、当用户点击nodeClick的时候，需要判断nodes中是否存在nodeClick的祖先节点，如果不存在的话，则触发out click事件。

按照这个分析，关键点就落在了判断节点父子关系上面了。

其实早在IE5的时候，Node.prototype上面就有一个函数contains，用于判断父子关系，具体文档可参见： https://developer.mozilla.org/en-US/docs/Web/API/Node.contains ，但是从文档中，我们也可以看见mobile部分测试不太充分，所以此处最好保留一个自己实现的版本，代码如下：

```js
function contains(parentNode, childNode) {
  var fn = Node.prototype.contains || function(childNode) {
    while (childNode) {
      if (childNode === parentNode) return true;
      childNode = childNode.parentNode;
    }
  };
  return fn.call(parentNode, childNode);
}
function isIn(parentNodes, node) {
  for (var i = 0, il = parentNodes.length; i < il; i += 1) {
    if (contains(parentNodes[i], node)) return true;
  }
  return false;
}
```

实现了这个之后，接下来的事情就是维护回调函数队列了，实现机制可能会有多种，此处给出其中一种。

给出一个Array，用于记录所有回调函数，其中每一个数组元素的结构如下：

```js
{
  nodes: [node1, node2, ...],      // 对应上一大步中的nodes变量，即事先设定好的那一组元素
  callback: function() {}          // 触发本次out click事件的回调函数
}
```

暂记这个Array变量的名字是outerCallbacks。

接下来，就剩下对外提供API了，此处向外部提供两个API：

* 1、on函数，用于注册回调函数；
* 2、off函数，用于取消回调函数。

on函数的实现非常简单，此处直接上代码：

```js
function outer(elem, callback) {
  if (!isFunction(callback)) return;            // isFunction = function(obj) {return Object.prototype.toString.call(obj) === '[object Function]';}

  outerCallbacks.push({
    nodes: (isArray(elem) ? elem : [elem]),     // isArray = function(obj) {return Object.prototype.toString.call(obj) === '[object Array]'}
    callback: callback
  });
}
```

实现off函数的时候，有一个难点和一个注意点：

难点：参数处理，条件判断；

注意点：在out click回调函数里面调用了off函数怎么办？