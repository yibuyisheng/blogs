<!-- config.time: 2015-06-01 -->
# 百度（EFE）前端框架学习笔记（ef）

官方 EF 学习资料：[ActionPanel](https://github.com/ecomfe/ef/blob/master/doc/ActionPanel.md)、[UIModel](https://github.com/ecomfe/ef/blob/master/doc/UIModel.md)、[UIView](https://github.com/ecomfe/ef/blob/master/doc/UIView.md)。

### UIView.js

与 ESUI 结合的 `View` 基类。该类有一个主入口方法 enterDocument()，该函数在容器渲染完毕后触发，用于控制元素可见性及绑定事件等 DOM 操作。

是 ESUI 中 View 类的子类。

该类对应的实例上会有一个视图上下文对象（ view.viewContext ），此上下文对象会传递给每个子控件，也就是说每个子控件都会有一个 viewContext 属性。此上下文对象的详细信息参看[百度 EFE 前端框架学习笔记（esui）](https://github.com/yibuyisheng/blogs/issues/4)的 `ViewContext.js` 部分。

enterDocument() 方法会调用 ESUI 的 main.init() 方法，初始化当前 UIView 实例所管辖的 container 部分，生成各种各样的控件等等。

此类生成的实例上有一个很重要的事件属性 uiView.uiEvents，该属性有2种方式：

* 以 `id:eventName` 为键，以处理函数为值，比如 `{'someId:click': function() {/* do something */}}`。
* 以 `id` 为键，值为一个对象，对象中以 `eventName` 为键，处理函数为值，比如 `{someId: {eventName: function() {/* do something */}}}`。

在此处声明的事件，运行时的 `this` 对象均是 `View` 实例，而非控件的实例。同时，在运行期，`UIView` 会克隆该属性，将其中所有的处理函数都进行一次 `bind`，将 `this` 指向自身，因此运行时的 `uiEvents` 与类声明时的不会相同。

此类上的 bindEvents() 方法就会根据 uiEvents 指定的事件配置来给子控件绑定事件。

### UIModel.js

处理 ESUI 场景的 `Model` 实现。 UIModel 继承自 er 的 Model。

UIModel 添加了 formatter 属性，用于对日期进行格式化。同时增加了一些操作数据的方法：set() 、 fill() 、 getPart()。

### ActionPanel.js

用于加载子Action的面板控件。继承自 esui 的 Panel 类，不过没有 setContent() 方法。

### 小技巧

```js
function getControl(node) {
    var controls = require('er/controller').currentAction.view.viewContext.getControls();
    for (var k in controls) {
        var control = controls[k];
        if (control.main === node) {
            return control;
        }
    }
}
```

该函数可以根据节点找到这个节点对应的控件对象，对debug有一定帮助。