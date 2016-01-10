<!-- config.time: 2015-05-22 -->
<!-- config.brief: Reflux 算是比较新的东西，由于自己水平有限，刚接触，不能很好地去使用 Reflux 来处理数据，下面是我使用 Reflux 逐步进化的过程（当然最终状态不一定就是标准的 Reflux 使用方式）： -->

# Reflux 使用进化日记

Reflux 算是比较新的东西，由于自己水平有限，刚接触，不能很好地去使用 Reflux 来处理数据，下面是我使用 Reflux 逐步进化的过程（当然最终状态不一定就是标准的 Reflux 使用方式）：

## 第一步：初识 Reflux

一直在听人说 Reflux ，说这个东西比较适合中小型的前端项目，使用起来很方便，于是我就找到了 Reflux  在 GitHub 的[主页](https://github.com/spoike/refluxjs)。

文档说 dispatcher 被移除了，没关系，反正我也没用过 Flux 。

于是继续阅读关于 actions 和 stores 的文档。由于心浮气躁急着用，看文档很马虎，action 、 store 可以监听过去监听过来的，还有 store 可以 connect 啥的，完全看晕了，无法用 Reflux 组织起一个完整的处理流程。但是没关系，我就按照文档上的这些 listen 啥的，自己来写写看吧。

于是， 创建 action ，在 store 中用 listenTo 来监听 action ，然后请求数据，store trigger 返回数据。写的时候，由于完全不理解 Reflux 怎么用，一通胡乱监听，写出来的代码不三不四，看着都觉得累。为了照顾项目进度，放弃 Reflux ，自己写一个 service 层吧。

## 第二步：认识了一点 Reflux

过了几天，对 Reflux 心有不甘，于是转头再去看 Reflux 文档，同时也很开心找到一篇[使用 Reflux 的经验文章](http://react.nodejs-china.org/t/liao-liao-ji-yu-fluxde-qian-duan-xi-tong/615)，于是知道了 action 可以当成方法调用，在 action 中监听调用，发出请求之类的，然后 store 做一些存储等操作，再 trigger ，component 中通过 mixin 来监听 store 中的 trigger ，然后做一些界面变动，摘录一段那篇文章中的例子：

```js
var Reflux = require('reflux');
var React = require('react');

var UserAction = Reflux.createAction({
    'login': {children: ['success', 'failed']}
});

UsersAction.login.listen(function(data) {
    $.post('/api/users/Action/login', data).then(this.success, this.failed);
});

var UserStore = Reflux.createStore({
    listenables: UserAction,
    onLoginSuccess: function(payload) {
        this.trigger(payload);
    },
    onLoginFailed: function(payload) {
        this.trigger(payload);
    }
});

var UserComponent = React.createClass({
    mixins: [Reflux.connect(UserStore, 'user')],
    render: function() {
        return <span>{this.state.user.name}</span>;
    }
});
```

感觉自己似乎知道怎么来组织流程了，于是很开心地又去改造代码，希望能用上 Reflux 。

写了一会儿，发现完了，因为有这样的场景：就拿上述一小段代码来说，UserAction 中很可能还有其它 action ，例如：

```js
var UserAction = Reflux.createActions({
    'login': {children: ['success', 'failed']},
    'register': {children: ['success', 'failed']}
});
```

login 和 register 两个 action 都会触发 UserStore 中相应方法的调用，然后这些方法再调用 trigger ，然后改变 UserComponent 中 `state.user` 的值，此处有两个问题：

* 1、登录和注册最终得到的数据真的都要反映到 UserComponent 的 `state.user` 上吗？这样合适吗？
* 2、如果登录报错了，怎么通知 UserComponent ，怎么告诉其错误信息？

想了想，有种方案：组织好 trigger 返回的数据结构，比如像这样：

```js
{
  actionType: 'login',                  // 本次 action 的类型
  status: 0,                                 // 0代表出错了，1代表成功了
  message: 'an error occurred'  // 错误信息
}
```

但是转念一想，这明显不对，肯定不是标准的用法，这样的话我又得在 component 中写好多代码来分析这些分发复杂的情况，太不优雅了。

想了半天，实在没想出好的方式，在[《聊一聊基于Flux的前端系统》](http://react.nodejs-china.org/t/liao-liao-ji-yu-fluxde-qian-duan-xi-tong/615)中也没找到相关内容。

于是，使用 Reflux 的想法再次被搁置，继续使用 service 吧！

## 第三步：别扭的方式解决出错处理

改回 service 之后，心中还是蛮不爽的，便去一个牛人云集的 React 群(161461760)求助，初步描述完我的问题之后，群中一位热心网友提出了他的方式：给 store 添加方法，获取 action 执行的结果。

感觉这种方式似乎能解决问题，虽然还是有点别扭，于是代码变成了这样：

```js
var Reflux = require('reflux');
var React = require('react');

var UserAction = Reflux.createActions({
    'login': {children: ['success', 'failed']}
});

UsersAction.login.listen(function(data) {
    $.post('/api/users/Action/login', data).then(this.success, this.failed);
});

var userStoreMixin = {
    getLoginResult() {
        if (this._error) {
            throw this._error;
        }
        return this._user;
    }
};
var UserStore = Reflux.createStore({
    listenables: UserAction,
    mixins: [userStoreMixin],
    onLoginSuccess(payload) {
        this._error = null;
        this.trigger(payload);
    },
    onLoginFailed(error) {
        if (error.status === -1) {
            this._error = new UnloginError(error.message);
        } else {
            this._error = new Error(error.message);
        }
        this.trigger();
    }
});

var UserComponent = React.createClass({
    mixins: [Reflux.listenTo(UserStore, 'onUserStore')],
    onUserStore() {
        try {
            this.setState({
                user: UserStore.getLoginResult()
            });
        } catch (e) {
            if (e instanceof UnloginError) {
                alert('not login');
            } else {
                alert(e.message);
            }
        }
    },
    render() {
        return <span>{this.state.user.name}</span>;
    }
});
```

似乎还行，于是开开心心地翻新项目代码，将 service 改成“这种的 Reflux ”。

## 第四步：产生新的想法

按照第三步的思维使用了一段时间之后，感觉实在是别扭，越来越感受到这不是标准的方案，写出来的代码看着有点丑。

于是想啊想，突然，灵光一闪，还是应该回归到第二步中写的那个例子啊，store 应该只是用来处理`正确的数据`，至于那些报错什么的，可以用额外的 action 、 store 来处理啊！于是上述代码应该是这个样子的：

```js
var Reflux = require('reflux');
var React = require('react');

var UserAction = Reflux.createActions({
    'login': {children: ['success', 'failed']}
});

UsersAction.login.listen(function(data) {
    $.post('/api/users/Action/login', data).then(this.success, this.failed);
});

var ErrorAction = Reflux.createActions({
    Unlogin: {}, // 未登录
    error: {}    // 一般性的错误
});

var UserStore = Reflux.createStore({
    listenables: UserAction,
    onLoginSuccess(payload) {
        this.trigger(payload);
    },
    onLoginFailed(payload) {
        if (error.status === -1) {
            ErrorAction.Unlogin(error.message);
        } else {
            ErrorAction.error(error.message);
        }
    }
});

var ErrorStoreMixin = {
    UNLOGIN: 1,
    ERROR: 2
};
var ErrorStore = Reflux.createStore({
    listenables: ErrorAction,
    mixins: [ErrorStoreMixin],
    onUnlogin(message) {
        this.trigger({type: this.UNLOGIN, message: message});
    },
    onError(message) {
        this.trigger({type: this.ERROR, message: message});
    }
});

var UserComponent = React.createClass({
    mixins: [Reflux.connect(UserStore, 'user'), Reflux.listenTo(ErrorStore, 'onErrorStore')],
    onErrorStore(error) {
        if (error.type === ErrorStore.UNLOGIN) {
            alert('not login');
        } else if (error.type === ErrorStore.ERROR) {
            alert(error.message);
        }
    },
    render() {
        return <span>{this.state.user.name}</span>;
    }
});
```

现在，感觉似乎完美一点了，代码看着也相对优雅。

不过，到目前为止，还有一点疑问：按照这种 store 写法，似乎会创建很多 store ，是否需要控制 store 数量，如果有必要，如何整合各个 store ？

带着一些疑问，继续前行吧，骚年！

（后续有使用心得的时候会继续更新本文章）