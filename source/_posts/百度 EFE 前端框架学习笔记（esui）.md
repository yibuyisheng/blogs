---
title: 百度 EFE 前端框架学习笔记（esui）
date: 2015-06-01
---

基础点：

### Control.js

控件基类模块，该类不可以直接使用，经过继承之后，形成更加具体的按钮之类的控件才使用，可以认为就是一个控件抽象基类。

包含如下一些自有属性：

* type ：控件的类型，比如 Button 、 Input 、 Form 、 Calendar 等等
* skin ：控件的皮肤，仅在初始化时设置有效，运行时不得变更
* styleType ：控件的样式类型，用于生成各class使用，如无此属性，则使用 Control#type 属性代替
* id ： 控件的 id

<!-- more -->

这些属性（ property ）均可在 html 代码中设置，比如：

```html
<div data-ui-type="Button"></div>
```

还有另外一部分自有属性，这些属性不能用于 html 代码设置：

* helper ：控件常用的一些方法组成的一个对象属性
* children ：子控件数组
* childrenIndex
* currentStates
* domEvents
* main ： 控件的主元素， HTMLElement 类型

原型（ Control.prototype ）上面有一些对象属性：

* ignoreStates ： 指定在哪些状态下该元素不处理相关的DOM事件

控件的生命周期中，有如下状态：

* NEW ： 在进入构造函数后，控件的状态就是 NEW 了
* INITED ： 控件完成 options 初始化（ initOptions() ）、视图环境初始化（ initViewContext() ）、扩展初始化（ initExtensions() ）之后状态就是 INITED 了
* RENDERED ： 控件第一次调用 render() 方法之后，就转变为 RENDERED 了
* DISPOSED ： 控件处于非 DISPOSED 状态下，调用 destroy() 方法，就变成了 DISPOSED 状态了

Control 上有一个重要的方法 render() ，用于渲染控件，该方法会去调用 repaint() 方法。

另外，Control 上还有一些 DOM 操作的方法，比如 appendTo() 、 insertBefore() 等。

Control 上的 get() 和 set() 很有猫腻。举个例子，如果这样调用 get() 方法： `get('some-title')` ，首先会去检测当前实例上面有没有 `getSomeTitle()` 方法，如果有，则直接调用这个方法，返回这个方法的返回值；如果没有，则直接返回当前对象的 `some-title` 属性。 `set()` 方法也是类似的。

setProperties() 方法可以用来批量设置属性，它会对一些特殊属性进行处理、控制，比如：

* 只有在渲染以前（就是 `initOptions()` 调用的那次）才允许设置 id 属性
* 如果要设置 viewContext ，则直接调用 setViewContext() 设置
* 有些属性要转换成布尔值，比如 disabled 、 hidden

setProperties() 也会对批量设置的值进行脏检测，如果发现有属性值发生了改变，则会调用 repaint() 方法。脏检测函数是 isPropertyChanged() ， 默认只会用恒等号去判断是否变化，但是可以在子类中覆盖这个方法，实现自己想要的脏检测功能。

### Button.js

按钮控件。主要有这么几种按钮：普通按钮、添加按钮、下载按钮、链接按钮、右上角关闭按钮。

可以对按钮设置皮肤（ data-ui-skin ），内置的皮肤有： spring 、 spring-add 、 download 、 layerClose 、 link 。

可以禁用掉按钮（ data-ui-disabled="diabled" ）。

按钮上 DOM 相关的事件只有 click 。由于按钮是间接继承自 EventTarget ，所以可以使用 on 、 un 等方法处理事件：

```js
// 给按钮绑定事件处理函数
someButton.on('click', handler);

// 5s 后取消绑定事件绑定
setTimeout(function () {
    someButton.un('click', handler);
}, 5000);

// 只执行一次的回调函数
someButton.once('click', function () {
    // only once
});

function handler(event) {
    // do something
}
```

具体按钮 demo 可参看[此处](http://yibuyisheng.github.io/esui-demo/demo/Button.html)。

### Validator

数据验证模块，主要有三个基础类 Validity 、 ValidityState 、 Rule 。

ValidityState 表示某个控件的某一条验证规则的状态（是否验证通过），有两个自有属性：

* state ： 验证状态， `true` 为值合法， `false` 为值非法
* message ： 验证信息，比如说错误提示语

Rule 是验证规则基类，是对 InputControl 的值的验证逻辑的抽象。每一个验证规则都包含一个 `check(value, control)` 方法，该方法返回一个 ValidityState 对象以表示验证结果。验证规则必须通过 main.registerRule() 进行注册后才可生效。每一个验证规则包含 `prototype.type` 属性来确定规则的类型。验证规则并不会显式地附加到控件上，而是通过控件自身的属性决定哪些规则生效，当控件本身具有与规则的`type`属性相同的属性时，此规则即会生效，例如：

```js
var textbox = main.create('TextBox', { maxLength: 30 });
textbox.validate();
```

由于 `textbox` 上存在 `maxLength` 属性，因此 `MaxLengthRule` 会对其进行验证，此特性可以从 main.createRulesByControl() 方法中看出。

Validity 主要用于存放一系列验证结果（ ValidityState ），如果验证失败，则会触发 InputControl 的 invalid 事件，该事件会带上一个 Validity 对象作为参数。

### InputControl.js

输入控件基类模块，用于表示需要在表单中包含的控件，主要提供 `getRawValue()` 和 `getValue()` 方法供获取值。该类是一个抽象类，不应该直接使用。

需要注意的是，控件其实并不通过严格的继承关系来判断一个控件是否为输入控件，只要 `getCategory()` 返回为 `"input"` 、 `"check" 或 `"extend"` 就认为是输入控件。

相比普通控件的 **禁用 / 启用** ，输入控件共有3种状态：

- 普通状态：可编辑，值随表单提交
- `disabled` ：禁用状态，此状态下控件不能编辑，同时值不随表单提交
- `readOnly` ：只读状态，此状态下控件不能编辑，但其值会随表单提交

setValue() 和 getValue() 分别用于设置输入控件的值和获取输入控件的值。 getRawValue() 和 setRawValue() 用于处理控件原始值，原始值的格式由控件自身决定。这两对处理输入控件值的方法的主要区别是，setValue() 会先调用控件的 parseValue() （子类可重写此方法）方法转换传入的值，然后再调用 setRawValue() 设置到控件上面去， getValue() 也会调用控件的 stringifyValue() （子类可重写此方法）将 getRawValue() 得到的值转换后返回。

getValidationResult() 方法用于获取此控件数据验证结果。

### BoxGroup.js

选择框组控件的各种使用可参见[此处](http://yibuyisheng.github.io/esui-demo/demo/BoxGroup.html)。

### CheckBox.js

`CheckBox` 控件在初始化时可以提供 `datasource` 属性，该属性用于控件判断一开始是否选中，且这个属性只在初始化时有效，不会保存下来。`datasource`可以是以下类型：

- 数组：此时只要`rawValue`在`datasource`中（使用`==`比较）则选上
- 其它：只要`rawValue`与此相等（使用`==`比较）则选上

[示例](http://127.0.0.1:8848/demo/CheckBox.html)。

### ControlCollection.js

控件集合，类似 `jQuery` 对象的功能，提供便携的方法来访问和修改一个或多个控件。

`ControlCollection` 提供 Control 的所有**公有**方法，但*没有*任何**保护或私有**方法。

对于方法， `ControlCollection` 采用 **Write all, Read first** 的策略，需要注意的是，类似 setProperties() 的方法虽然有返回值，但被归类于写操作，因此会对所有内部的控件生效，但只返回第一个控件执行的结果。

`ControlCollection` 仅继承 Control 的方法，并不包含任何子类独有方法，因此无法认为集合是一个 InputControl 而执行如下代码：

```js
collection.setValue('foo');
```

此时可以使用通用的 set() 方法来代替：

```js
collection.set('value', 'foo');
```

根据 set() 方法的规则，如果控件存在 `setValue()` 方法，则会进行调用。

### ViewContext.js

视图环境类，一个视图环境是一组控件的集合，不同视图环境中相同 id 的控件的 DOM id 不会重复。

该类的实例包含的主要属性为：

* controls ：该视图环境下所有的控件
* groups ：视图环境控件分组集合
* id ：视图环境 id，只读

当前页面所有的视图环境对象都会以`id->对象`的形式保存在私有的 pool 变量中。

### painters.js

渲染器模块，负责 dom 渲染。

可以生成各种各样的渲染器（ painter ）。例如：

* painters.state()：生成一个将属性与控件状态关联的渲染器
* painters.attribute()：生成一个将控件属性与控件主元素元素的属性关联的渲染器
* painters.style()：生成一个将控件属性与控件主元素元素的样式关联的渲染器
* painters.html()：生成一个将控件属性与某个DOM元素的HTML内容关联的渲染器
* painters.text()：生成一个将控件属性与某个DOM元素的HTML内容关联的渲染器
* painters.delegate()：生成一个将控件属性的变化代理到指定成员的指定方法上

借助于这些方法，可以为某一个控件生成一组渲染器，当该控件发生了变化（样式属性变化等），相应的渲染器就会被调用，从而保证了数据与界面的一致性，形成了单向数据流，同时也比较细腻度地更新指定界面部分，不会出现全局刷新的情况。

### Extension.js

扩展基类，针对控件的扩展。

`Extension` 类为扩展基类，所有扩展类需要继承于 `Extension` 。扩展类需要通过 main.registerExtension 方法，注册扩展类型。注册扩展类型时将自动根据 `prototype.type` 进行类型关联。

一个控件实例可以组合多个`Extension`实例，但一个控件实例对同种类型（即 `type` 相同）的 `Extension` ，只能拥有一份。

从设计上而言， `Extension` 不同于普通脚本对控件的操作，相比 ESUI 从设计理念上不希望普通脚本操作控件的保护属性及内部DOM元素，扩展则对控件拥有**完全开放**的权限，这包含但不限于：

- 注册事件、修改属性等其它逻辑程序可做的行为。
- 覆盖控件实例上的相应函数，如 `render()` 或 `addChild()` 等。
- 读取`核心属性`与`关键属性`，包括 `type` 、 `main` 等。
- 可接触控件内部的 DOM 对象，即可以访问 `main` 及其子树，并对 DOM 做任何操作。

在控件初始化时，会对扩展进行初始化，其基本流程为：

1、 当控件 `init` 之后，会依次对所有关联 `Extension` ，调用 `attachTo()` 方法。一个类型的 `Extension` 仅能在控件实例上附加一次，如果一个控件已经附加了同类型的 `Extension` 实例，则跳过本次 `attachTo` 操作。
2、 当控件 `dispose` 之前，会依次对所有关联 `Extension` ，调用其 `dispose()` 方法。

有多种方法可以将扩展绑定到具体的控件实例上：

- 在控件创建时绑定

    通过控件构造函数参数 `options.extensions` 可以为控件绑定扩展。

    ```js
    new TextBox({
        extensions: [
            new MyExtension({ ... }),
            new OtherExtension({ ... })
        ]
    });
    ```

- 在使用HTML生成时绑定

    在HTML中，使用 `data-ui-extension-xxx` 属性注册一个扩展：

    ```html
    <div id="main-panel" class="wrapper"
        data-ui-type="Panel"
        data-ui-extension-command-type="Command"
        data-ui-extension-command-events="click,keypress,keyup"
        data-ui-extension-command-use-capture="false"
    </div>
    ```

    在HTML中，使用 `data-ui-extension-*-property` 属性添加扩展，其中`*`作为扩展的分组，可以是任何字符串，相同的`*`将作为对同一扩展的定义，必须包含 `data-ui-extension-*-type` 定义扩展的类型，而其它 `data-ui-extension-*-property="value"` 属性则将作为 `options` 参数的属性传递给扩展的构造函数。

- 在实例创建后动态地绑定

    在控件创建后，可以动态创建扩展并在适当的时候绑定至控件。

    ```js
    var panel = new Label({ text: 'abc' });
    var delegateDOMEvents = main.createExtension(
        'Command',
        {
            eventTypes: ['click', 'keypress', 'keyup'],
            useCapture: false
        }
    );
    // 需主动调用attachTo方法
    delegateDomEvents.attachTo(panel);
    panel.appendTo(container);
    ```

- 全局绑定

    调用{@link main#attachExtension}函数可在全局注册一个扩展：

    ```js
    main.attachExtension('Command', { events: ['click'] });
    ```

    全局注册的扩展，将会被附加到**所有**控件的实例上。使用 `options` 参数作为 `Extension` 创建时的选项，创建 `Extension` 实例时会对 `options` 做复制处理。

    具体可以参考 extension.Command 作为示例，来学习扩展的编写。

### src/main.js 中的 main.init() 方法

该方法是整个 esui 的入口方法，可以指定当前要使用 esui 的 dom 节点容器，类似于 angular.bootstrap() 或者 React.render()，都是以指定的 dom 元素为根，然后开始渲染这块地盘。具体参数传递可参看文档。

该方法会返回一个这个块地盘初始化的控件对象集合，例如：

```html
<div id="container">
    <button data-ui="type:Button;id:defaultBtn;">默认按钮</button>
    <span data-ui="type:Button;id:springBtn;skin:spring">创建</span>
    <div data-ui="type:Button;id:springAddBtn;skin:spring-add">添加</div>
    <div data-ui="type:Button;id:downloadBtn;skin:download">下载</div>
    <div data-ui="type:Button;id:actBtn;">改变文字</div>
</div>
```

此 container 初始化后就会返回五个控件对象控件的集合。

### 类关系

* ControlCollection
    * ControlGroup
* Extension
* EventTarget
    * Control
        * Button
        * CommandMenu
        * Crumb
        * InputControl
            * BoxGroup
            * Calendar
            * CheckBox
            * RangeCalendar
            * Region
            * RichCalendar
            * Schedule
            * Select
            * TextBox
            * TextLine
        * Dialog
        * Label
        * Frame
        * Pager
        * Panel
            * Form
            * Overlay
        * SearchBox
        * Sidebar
        * Tab
        * Table
        * Tip
        * TipLayer
        * Toast
        * Tree
        * Validity
        * Wizard
    * Layer
    * Link
    * MonthView
* SafeWrapper
* TreeStrategy
* ViewContext

### 一些总结

绝大多数控件在源码中其实都有比较详尽的说明了，只要仔细看看注释，再结合相关代码，很快就会用了。不过，在看代码的时候，以下几处务必留意：

* 1、 initOption() 函数，该函数会初始化一些参数，很多都可以通过 `data-ui-xxx` 来设置，也可以通过 set() 方法来设置；
* 2、 repaint 属性，该属性中存放了重绘相关的配置，留意会造成重绘的属性，这些属性往往也可以用上条所述方式设置；
* 3、留意控件会触发什么事件，直接在源代码中搜索 `fire(` ，即可快速知道该控件会触发什么事件。


