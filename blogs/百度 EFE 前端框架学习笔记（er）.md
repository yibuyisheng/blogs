<!-- config.time: 2015-05-29 -->
# 百度 EFE 前端框架学习笔记（er）

首先上一张图：

![](https://raw.githubusercontent.com/ecomfe/er/master/doc/asset/er-overview.png)

### ajax.js

此模块返回一个 ajax 对象，用于发送 ajax 请求，最主要的就是 request 方法。同时该对象上也会挂载 Ajax 构造函数。

返回的 ajax 对象上会带有一个钩子属性（ hooks ），钩子属性上包含的类容可能有：

* serializeData()： 将数据序列化为适合发送 http 请求的格式
* serializeArray()：序列化一组数据，以便发送 http 请求
* beforeExecute()：在请求发送之前调用
* beforeCreate()：在创建 XMLHttpRequest 对象之前调用，如果该函数返回 true，则会返回一个假的 promise 对象
* afterReceive()：在接受到响应的时候调用，此时，返回的数据都还未做解析处理
* afterParse()：响应的数据已经经过解析处理了
* beforeSend()：在 xhr 对象的 open() 调用之后，send 调用之前调用

request() 函数只有一个 options 对象参数，其属性如下：

* url：请求 url
* method：请求方法，POST 、 GET
* data：请求附带的数据对象
* xhrFields：给 xhr 对象上混入的属性
* dataType：返回的数据类型，比如，如果是 `json` 的话，则会对 xhr.responseText 做 JSON 解析
* contentType：请求 MIME 类型，默认是 application/x-www-form-urlencoded，仅在 method 为非 GET 方式的时候有效

request() 函数的 options 参数上还可能混入其他一些参数，这些参数都是通过 xhr.config 来配置的，是 ajax 对象的全局配置，这些属性包括：

* cache：如果为 false，则会在请求的 url 后面加上时间戳参数
* timeout：如果 timeout 大于0，则会有请求超时。如果发生了超时，则会触发 ajax 对象的 timeout 事件
* charset：跟在 http contentType 后面的 charset，例如：application/x-www-form-urlencoded;charset=UTF-8

ajax 对象上除了 request 方法，还有如下一些方法：

* get()：发送 GET 请求的简短方法
* getJSON()：用 GET 请求获取 JSON 数据
* post()：发送 post 请求
* log()：发送前端日志信息，不保证成功，没有回调

### Action.js

Action 类，用于构造 action 对象。action 代表一种动作，比如页面跳转、鼠标事件、键盘事件等，都可以产生一个 action。

action 上会附着 model 和 view，进入 action 的时候，会先去加载 model 指定的数据，然后根据拿到的数据来渲染 view 指定的视图。

任何一个有 enter() 方法的对象都可作为 action 对象。

enter() 方法开启了 action 的生命周期，在 action 的生命周期中，会触发如下事件：

* enter：action 生命周期开始了
* beforemodelload：action 上的 model（ action.model ） 加载之前触发
* modelloaded：model 加载完成
* beforerender：视图渲染之前
* rendered：视图渲染完成
* entercomplete：action 完成启动
* beforeleave：离开 action 之前
* leave：离开 action 之后，销毁注册在 action 上所有事件之前触发

action 生命周期相关的一些方法：

* enter()：action 入口函数
* forwardToView()：转入 view 处理流程
* leave()：离开 action，销毁 action 上的所有事件
* reload()：重加载当前 action

### Model.js

MVC 中的 Model，主要用于从后端取数据，然后提供一些方法管理取到的数据。其中 load() 方法用于取数据，该方法会根据当前 model 对象上的数据源对象（ model.datasource ）去后端取数据。

数据源是对数据一系列配置，其中保存了多个数据的获取函数，有以下方式：

* 单一数据源配置

    如果`datasource`是一个函数，则认为该函数是一个数据获取函数，
    执行该函数，并把返回值按照一个对象放到当前 model 中
    ```js
    // 配置从指定的URL获取数据
    datasource = require('./datasource').remote('/model/list')
    ```

* 并发请求数据

    通过一个对象配置并发的数据获取。对象中每一个属性对应一个获取函数，
    当数据获取后，会调用 `this.set(name, result)`，以属性名为键值添加
    ```js
    // 并发请求多个URL
    datasource = {
        'list': require('./datasource').remote('/model/list'),
        'config': require('./datasource').constant('listConfig')
    };
    ```

* 串行请求数据

    通过一个数组配置并发的数据获取，数组中包含对象。将按照数组的顺序，
    依次加载每一个对象（对象中的各属性是并发）
    ```js
    // 串行请求几个URL
    datasource = [
        { 'config': require('./datasource').constant('config') },
        { 'list': require('./datasource').remote('/model/list') }
    ];
    ```
    注意使用该方案时，各对象中的键**不要相同** ，否则会造成数据的覆盖

* 嵌套配置

    数组和对象可以相互嵌套，但有一个限制：

    > 当一个对象中某个属性的值为普通对象（非数据加载配置项）或数组时，
    > 该属性名将不起作用，即不会在 model 对象中存在以该属性名为键的值。

    以下为一个串行和并行混杂的数据源配置：

    ```js
    datasource = {
        'one': [getX, getY, getZ],
        'two': getA,
        'three': [
            { 'four': getB },
            { 'five': getC }
        ]
    };
    ```

    以上对象将在最终的 model 对象中生成 `two` 、 `four` 和 `five` 属性，而 `one` 、 `two` 和 `three` 因为属性值为普通对象或数组，将被忽略，其中`one`对应3个函数，将会把函数的返回值展开后添加到当前 model 同样，注意在嵌套的同时，各属性名**不要相同**，除非该属性名称没用，以避免出现数据相互覆盖的情况。

* 通过数据获取配置项

    上面所述的各种方案，均是数据获取配置项的简写，一个数据获取配置项的结构请参考 meta/DatasourceOption.js。因此，可以使用数据获取配置项来处理一些例外情况，比如并行加载2个对象，且2个对象均无对应的键值，需要完整添加到 `Model` 对象：

    ```js
    // 并行加载对象并完整添加到`Model`对象
    datasource = [
        {
            retrieve: require('./datasource').remote('/model/list'),
            dump: true
        },
        {
            retrieve: require('./datasource').remote('/user/info'),
            dump: true
        }
    ];
    ```

    对于不同的简写，其与数据获取配置项的对应关系如下：

    - 普通的函数，映射为 `{ retrieve: {fn}, dump: true }`
    - 对象中的一个属性，映射为 `{ retrieve: {fn}, name: {name} }`

### View.js

在 aciton 的生命周期中，加载完 model 数据之后，就会渲染视图了，此时调用的是 view.render() 方法，也就是说 view.render() 就是 view 的入口函数。er 的视图默认使用 [etpl](https://github.com/ecomfe/etpl) 模版引擎渲染。

在指定容器内渲染出 html 结构之后，就会调用 view.enterDocument() 方法，用于控制元素可见性及绑定事件等DOM操作。比如利用 [esui](https://github.com/ecomfe/esui) 来初始化各种控件等等。

### controller.js

控制器类，负责 URL 与 Action 的调度，将 URL 映射到具体的一个 action 的执行上。

可以使用 controller.registerAction() 方法来注册 action 配置，配置数据放在 controller.actionPathMapping 属性上（ path 到配置对象的映射 ）。每一个配置对象包含以下属性（ actionConfig ）：

* path：该 action 对应的 url path
* type：如果是一个字符串，则认为是此 action 的模块路径，否则认为就是一个模块对象，直接使用
* movedTo：如果此属性存在，则会定向到此属性指定的 URL，类似于302
* childActionOnly：如果为 true，就说明这个配置仅用于子 action
* authority：权限配置，参考 meta.ActionConfig#authority 属性的说明
* title：
* documentTitle

当路径改变时，会调用 controller.renderAction() 方法，此处渲染的是主 Action。渲染之前，会去 controller.actionPathMapping 上查找相应的 action 配置，如果找不到，则会跳转到404 url（404 url 可以通过 controller.setNotFoundLocation() 来设置）；如果没有找到404对应的 action 配置，则会 reject。判断完 action 配置是否存在之后，会检查是否有权限访问这个 url，如果没有权限，则会跳转到没有权限的页面（此页面可以通过 controller.setNoAuthorityLocation() 设置）。

在 action 的渲染过程中，会伴随一个 actionContext 对象，里面包含如下属性：

* url：此 action 对应的 url，是一个 URL 类的对象
* container：容器元素的 id
* isChildAction：是否是子 action
* originalURL：之前的 url，在重定向、404、未授权的情况下，此属性会被设置，指代原始的那个 url
* title：如果这个 action 是主 action，那么这个属性可以修改文档标题（ document.title ）
* args：有 actionContext 对象的所有属性（除 args 属性之外）
* documentTitle：如果这个 action 是主 action，那么这个属性可以修改文档标题（ document.title ）。此属性比 title 属性优先级低

controller 对象有一个 eventBus 属性，该属性是 mini-event.EventBus 的实例。在此实例上，会有如下一系列事件触发：

* forwardaction：加载 action 之前
* actionmoved：action 重定向，类似于302过程
* actionnotfound：没有找到当前 url 对应的 action 配置
* permissiondenied：没有权限访问当前的 url
* actionabort
* actionfail：当前 url 没有对应的 action 模块实现，或者创建 action 失败
* actionloaded：action 加载完成
* leaveaction：之前的主 action 销毁
* enteraction：进入 action 之前触发

对于当前 url 加载到的 action 模块对象，如果是一个函数，则认为是一个 Action 构造函数，直接实例化；如果是一个包含 createRuntimeAction() 的对象，则认为这个 createRuntimeAction() 函数就是一个 Action 工厂函数，调用该工厂函数就可以创建出 action 对象；否则认为这个模块对象就是 action 实例。

找到了当前 url 对应的主 action 之后，就要开始进入这个 action 了。在进入之前，需要销毁之前的主 action（调用 action.leave() 方法）。销毁之后，调用 action.enter()，进入当前 action。




