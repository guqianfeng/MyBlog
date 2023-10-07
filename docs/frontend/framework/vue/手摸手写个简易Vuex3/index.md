---
outline: deep
---

# 手摸手写个简易Vuex3

## 背景&任务

大家好，我是梅利奥猪猪，一位持续进步的讲师！上次写的[手摸手写个最简单的 hash 路由](https://juejin.cn/post/7228407297604255781)有不少小伙伴看了感觉收获很大，那这次将继续带给大家Vue全家桶之**Vuex**简易实现，看完这篇文章，你将收获Vuex核心源码的知识!注意了，本次分享是Vuex3，也就是Vue2版本用的哈！

具体需要实现功能如下

- 手写Vuex

  - 自己手写个 my-vuex，把原本`store/index.js`的代码从`import Vuex from 'vuex'` 改成 `import Vuex from './my-vuex.js'`

  - 实现完成后能看到以下效果，那本篇文章任务就完成了
    - state响应式数据处理
    - 通过commit方法能修改状态
    - 通过dispatch异步修改状态
    - (补充新增)getters的实现

- 其他功能暂时不写，剩下的功能有兴趣的小伙伴可以自行看源码补充
  - 辅助map系列
  - 模块化modules
  - .....
  - 主打实现简易版（狗头保命）

具体细节知识如下

- `Vue.use` - vuex还是有些细节！非常好玩！
- `main.js`中实例化**Vue**时传入**store**，为什么要传呢（等价于源码里到底怎么用的）
- `state`响应式怎么处理
- `commit`如何实现
- `dispatch`如何实现
- `this`指向问题
- (补充)`getters`实现
- ...
- 还有些细的这里就不列举了

是不是很兴奋！那我们开始撸代码吧

## 准备工作

### 搭环境

首先先用脚手架 vue-cli 搭好项目，需要安装依赖 vuex(Vue Router我也安装了)，这里就不多赘述了

### 写些最简单的功能

我们就写个计数器，然后提供mutations和actions（这里记得打印下this后面我们会处理this指向）

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
  },
  mutations: {
    add (state, payload = 1) {
      console.log(this) // 不要忘记打印this
      state.count += payload
    }
  },
  actions: {
    asyncAdd (context, payload = 1) {
      setTimeout(() => {
        console.log(this) // 不要忘记打印this
        context.commit('add', payload)
      }, 1000)
    }
  },
  modules: {
  }
})

```

紧接着，我在AboutView页面组件里编写了如下代码

```html
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>state - {{ $store.state.count }}</h2>
    <button @click="$store.commit('add')">add 1</button>
    <button @click="$store.commit('add', 2)">add 2</button>
    <button @click="$store.dispatch('asyncAdd')">async add 1</button>
    <button @click="$store.dispatch('asyncAdd', 2)">async add 2</button>
  </div>
</template>

```

以上都属于基操，Vuex的一些基本使用，随后我们就能看到这样的效果（小伙伴们注意看下打印的this是什么）

![01-Vuex基操.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d59420b97a7240118b35f4964e7ce4f3~tplv-k3u1fbpfcp-watermark.image?)

友情提示哈，this指向都是Store实例哈，然后我们把`store/index.js`中，改成`my-vuex.js`就可以了

![02-改成my-vuex.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cb62e76070b45d2a115503e40686565~tplv-k3u1fbpfcp-watermark.image?)

看到以上报错说明准备工作就好了，接下去我们就要开始实现自己的vuex了

## 开发走起

### 开发插件

前面的报错，其实是实例化`Store`，没有`Store`这个类才报错的，正好和我们开发插件结合在一起说

众所周知，开发插件本质就是实现`install`方法，但这个和我们之前的`VueRouter`又有些不一样，`VueRouter`核心就是实现`VueRouter`类，然后提供`install`静态方法就可以了！那`Vuex`的核心是啥呢

有的小伙伴可能会说，不就是`state，mutations，actions`等等等，但我要和大家说核心是store，你们说的这些都是我们使用时配置的一些选项！不知道大家现在能否想通，其实很好理解，给大家看下以下的代码

```js
store.state.xxx
store.commit('xxx', payload)
store.dispatch('yyy', payload)
```

小伙伴们，发现没有，每行代码开头的是什么，是**store**实例啊！所以Vuex的核心是实现Store类！那这个时候大家肯定又会有这样的想法！我懂了，所以在该类上定义静态方法`install`！那其实又不对了，仔细想下，我们`Vue.use`里传入的是什么，是不是这样使用的`Vue.use(Vuex)`,而不是`Vue.use(Store)`吧。并且在想下Store实例是怎么`new`出来的，具体代码是不是长这样子的`new Vuex.Store`，所以通过分析，我们得知Vuex这个对象里应该有2个重要属性

- 一个是Store类 - 核心
- 一个是install方法 - 开发插件必须

所以都分析成这样了，那代码架子就手到擒来！

```js
class Store {

}

const install = () => { }

export default {
  Store,
  install
}

```

![03-开发插件.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c2cd4b858b44c1290b03a73938985e0~tplv-k3u1fbpfcp-watermark.image?)

此时报错信息也变了，因为我们提供了Store类，然后模板里使用了`$store`，然后报错了`$store`

### $store的处理

那小伙伴们，`$store`该怎么处理呢，首先肯定是要挂载到Vue原型上的，这个肯定没问题，那实例怎么来呢！对了，不就是和我们之前`router`实例一样的操作方式吗

- `main.js`中`new Vue`的时候把store实例作为参数传入了
- 所以根组件里是可以拿到`store`实例的
- 源码依然使用混入的方式，在`beforeCreate`巧妙的拿到`store`实例
- 因为有对应的`if`判断，所以只会在根组件这里执行一次，挂载到`Vue`原型上

具体代码如下

```js
const install = (Vue) => {
  Vue.mixin({
    beforeCreate () {
    //   console.log(this.$options.store)
      if (this.$options.store) {
        // 根组件才有这个东西，这个if只会执行一次
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}
```

![04-$store处理.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2622a7b32f68462b94a1610ace931e9b~tplv-k3u1fbpfcp-watermark.image?)

上图所示，报错信息已经变成了其他的，说明`$store`已经处理好了，之后就报了`state`的`count`的错

### state响应式处理

大家都知道，`Vuex`是响应式的，本质上是`state`是响应式的，和`VueRouter`一样，我们依然要借用`Vue`的力量，给`state`做响应式处理！那如何借用呢，这么处理！

```js
let _Vue
const install = (Vue) => {
  _Vue = Vue // 这样Store的构造函数里就可以拿到Vue了，使用new _Vue即可
  ...
}
```

这里我们可以在构造函数内部提供实例化Vue，并且提供`$$state`数据，这样`$$state`就是响应式的我们也可以打印下看下

```js
class Store {
  constructor (options) {
    this.options = options
    this._vm = new _Vue({
      data () {
        return {
          $$state: options.state
        }
      }
    })
    console.log(this._vm)
  }
}
```

![05-$$state响应式处理.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a065ba3f62cb4029ab5c6b317af60a9d~tplv-k3u1fbpfcp-watermark.image?)

但我们使用上应该是这么用的吧`$store.state.xxx`，那这该怎么处理呢，在类中提供`get state`方法就可以了

```js
  get state () {
    return this._vm._data.$$state
  }
```

此时页面清爽了，没有报错了，并且成功渲染出了页面

![06-get方法state处理.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79433bcac2b842ffbaab7f956154fb17~tplv-k3u1fbpfcp-watermark.image?)

### mutations处理 - 实现commit方法

现在如果我们点击**add 1**按钮和**add 2**按钮是会报错的，因为还没有实现commit方法

![07-点击按钮报错commit.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/274441b555d6457bb375c699fb064770~tplv-k3u1fbpfcp-watermark.image?)

那接下去我们就慢慢来实现这个方法

#### 拿到用户传入的mutatinos

我们都知道，在使用`vuex`的时候，我们是不是在对象里会定义`mutations`，然后会把他传入我们`new Store`中，所以在`options`里就有我们传入的`mutations`字段，我们可以定义`commit`方法打印下对应的数据

```js
class Store {
  constructor (options) {
    ...
    this.mutations = options.mutations
    ...
  }
  ...
  commit () {
    console.log(this.mutations)
  }
}
```

![08-点击后打印mutations.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b78dc4b835c4acda293e415e44fe5a1~tplv-k3u1fbpfcp-watermark.image?)

`mutations`的确拿到了，那之后不就是找到对应的方法调用就可以了

#### 实现commit方法

##### 找到对应的mutation方法

在实现`commit`方法前，我们先思考下，我们是如何使用`commit`的，传入**对应的mutation方法名**以及**payload参数**对不对，比如`$store.commit('xxx', payload)`，所以大家说commit有几个形参，对头不就是这两个吗，并且通过第一个参数方法名，不就能找到对应的方法了吗，代码如下

```js
  commit (type, payload) {
    // console.log(this.mutations)
    const entry = this.mutations[type]
    if (!entry) {
      console.error('找不到你的mutation方法')
    }
    console.log(entry)
  }
```

![09-找到对饮给的mutation方法.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1820147bb2f04124a4c6400d703d5715~tplv-k3u1fbpfcp-watermark.image?)

##### 调用对应的mutation方法

找到对应的方法后，调用他不就可以了，我们发现应该有2个参数

- state参数
- payload参数

所以实现上应该是这样

```js
  commit (type, payload) {
    // console.log(this.mutations)
    const entry = this.mutations[type]
    if (!entry) {
      console.error('找不到你的mutation方法')
    }
    entry(this.state, payload)
  }
```

![10-实现commit方法.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13faf5102a3247678a75030096df2486~tplv-k3u1fbpfcp-watermark.image?)

很明显，我们已经基本完成了，已经可以修改`state`，但还差个`this`指向问题

##### this指向问题

在实现`my-vuex`之前，我们知道，我们定义的`mutation`方法的`this`指向，是指向`store`实例的，所以我们要把`this`的指向处理下

在这个例子中，要把`add`方法的`this`指向改成`store`实例，那如何修改`this`指向呢，我们可以使用`bind`

```js
  commit (type, payload) {
    // this.mutations[type]可以拿到对应的方法，bind为了改变this指向，这里的this就是store实例
    const entry = this.mutations[type].bind(this)
    if (!entry) {
      console.error('找不到你的mutation方法')
    }
    entry(this.state, payload)
  }
```

![11-修改this指向.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4a8556b82a44dcca15cc60036500682~tplv-k3u1fbpfcp-watermark.image?)

到这里**mutations处理-实现commit**就完成了

### actions处理 - 实现dispatch方法

#### 参考前面commit的实现，快速搭架子

接下去实现`dispatch`方法，前面的步骤和`mutations`是几乎一致的，我们快速处理下

```js
class Store {
  constructor (options) {
    ...
    this.actions = options.actions
    ...
  }
  ...
  dispatch (type, payload) {
    const entry = this.actions[type].bind(this)
    if (!entry) {
      console.error('找不到对应的action方法')
    }
    console.log(entry)
  }
}
```

![12-dispatch方法架子.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/338763e2793240fe8c38034a99baee35~tplv-k3u1fbpfcp-watermark.image?)

#### 实现dispatch方法

然后我们就要来实现`dispatch`了，那`dispatch`和`commit`到底有什么区别呢

- 形参上不一样
  - `dispatch`**第一个参数是上下文**，这里简易实现我们用`this`就可以了
  - `commit`**第一个参数是state**，所以前面我们用的是`this.state`

- 同步异步的问题
  - `dispatch`**异步处理**，我们有时候需要拿到结果，所以这次方法执行后的结果要`return`，这里简易实现，就直接`return`方法执行的结果即可
  - `commit`**同步处理**，不需要做`return`处理

所以具体实现这样做

```js
  dispatch (type, payload) {
    const entry = this.actions[type].bind(this)
    if (!entry) {
      console.error('找不到对应的action方法')
    }
    // console.log(entry)
    return entry(this, payload)
  }
```

![13-实现dispatch.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b54649417e134855a767b27b78a22ce3~tplv-k3u1fbpfcp-watermark.image?)

至此，`dispatch`也实现完成了，完结撒花

### (补充) getters实现

> 于23年5月12日补充该知识点

#### 复习getters语法

小伙伴们，接下去我们在来实现下`getters`，首先我们还是用回原先的`vuex`，先把`getters`的语法在来复习下

```js
import Vuex from 'vuex'
// import Vuex from './my-vuex.js'
...
export default new Vuex.Store({
  ...
  getters: {
    // 注意形参有state
    doubleCount (state) {
      return state.count * 2
    }
  },
  ...
})

```

写完getters后，在组件里使用下

```vue
<h2>getters - {{ $store.getters.doubleCount }}</h2>
```

然后测试下，看下是否work，的确就是我们熟悉的getters，效果也是正常的

![14-复习getters.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae60784efbd646c284f39cf45629a5da~tplv-k3u1fbpfcp-watermark.image?)

#### 用回自己的my-vuex-处理getters报错

前面快速的复习了getters的用法，那接下去就要手撕getters了，先用我们自己的my-vuex，看下页面有什么报错

![15-用回自己vuex的getters报错.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00583a8d8aa84c0aacab437f79d5831b~tplv-k3u1fbpfcp-watermark.image?)

这个为什么会报错呢，很明显，我们store上没有getters属性，所以我们可以直接加一行`this.getters = {}`试试，在我们加上这行代码之后，控制台的报错就消失了

![16-getters报错就消失了.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2da93795e7a4a4a91b7c310dc21d8ae~tplv-k3u1fbpfcp-watermark.image?)

处理getters报错这一趴，在做最后一件事，接收下用户传入的getters，我们用一个新的字段名`_wrappedGetters`接收下用户传入的getters

```js
  constructor (options) {
    ...
    this._wrappedGetters = options.getters
    this.getters = {}
    console.log(this._wrappedGetters)
    ...
  }

```

![17-接收用户传入的getters.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6999988ec0e40d7893160cc31153490~tplv-k3u1fbpfcp-watermark.image?)

能看到控制台打印的方法，的确是用户传入的getters

#### getters核心实现之computed处理

大家都知道，getters中的数据其实就是基于state派生出来的属性，所以本质上还是要用到计算属性的，我们可以先搭这样的架子

```js
  constructor (options) {
    ...
    // 计算属性是个对象
    const computed = {}
    this._vm = new _Vue({
      data () {
        return {
          $$state: options.state
        }
      },
      // vue中的选项computed计算属性
      computed
    })
    ...
  }
```

那无非最后要把getters转换成computed，可以先做这样的遍历

```js
    const computed = {}
    // 以下代码是新增的遍历
    Object.keys(this._wrappedGetters).forEach(key => {
      // 获取用户传入的getter
      const fn = this._wrappedGetters[key]
      console.log(fn)
    })
    this._vm = new _Vue({
      data () {
        return {
          $$state: options.state
        }
      },
      computed
    })
```

![18-遍历打印用户传入的getter.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/990993c261394229a7701ba52e32e224~tplv-k3u1fbpfcp-watermark.image?)

但我们用过vue的都知道，计算属性，形参是没有的，我们正常用`computed`是不是长这个样子的

```js
computed: {
  doubleCount() {
    return ....
  }
}
```

所以我们要做个转换

```js
    Object.keys(this._wrappedGetters).forEach(key => {
      const fn = this._wrappedGetters[key]
      console.log(fn)
      // computed里面的方法是没有形参的
      computed[key] = function () {

      }
    })
```

那最后计算属性返回的是什么，是我们用户传入的getters执行下就可以了，这里要注意下，形参有state，所以我们要传入state，还有我们这里当心this的一些指向问题，所以处理方案是这样的

```js
    // 处理this的问题，store现在就是实例
    const store = this
    this._wrappedGetters = options.getters
    this.getters = {}
    const computed = {}
    Object.keys(this._wrappedGetters).forEach(key => {
      const fn = this._wrappedGetters[key]
      computed[key] = function () {
        // 要执行getter函数拿到计算后的结果
        return fn(store.state)
      }
    })
```

此时基本就完成了，还差最后一步，就是通过`Object.definePrototype`获取getters对应的数据，getters的实现具体代码如下

```js
    const store = this
    this._wrappedGetters = options.getters
    this.getters = {}
    const computed = {}
    Object.keys(this._wrappedGetters).forEach(key => {
      const fn = this._wrappedGetters[key]
      computed[key] = function () {
        return fn(store.state)
      }
      // 定义getters中的属性，键就是key，值取vm中的计算属性
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key]
      })
    })
    this._vm = new _Vue({
      data () {
        return {
          $$state: options.state
        }
      },
      computed
    })
```

![19-实现myVuex的getters.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19d564eac9d34583b1aec0009359cd16~tplv-k3u1fbpfcp-watermark.image?)

那到这里我们就实现好了getters!噢耶

## 总结

### 最终代码

```js
let _Vue
class Store {
  constructor (options) {
    this._mutations = options.mutations
    this._actions = options.actions
    const store = this
    this._wrappedGetters = options.getters
    this.getters = {}
    const computed = {}
    Object.keys(this._wrappedGetters).forEach(key => {
      const fn = this._wrappedGetters[key]
      computed[key] = function () {
        return fn(store.state)
      }
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key]
      })
    })
    this._vm = new _Vue({
      data () {
        return {
          $$state: options.state
        }
      },
      computed
    })
  }

  get state () {
    return this._vm._data.$$state
  }

  commit (type, payload) {
    const entry = this._mutations[type].bind(this)
    if (!entry) {
      console.error('你传入的方法名在mutations没找到')
      return
    }
    entry(this.state, payload)
  }

  dispatch (type, payload) {
    const entry = this._actions[type].bind(this)
    if (!entry) {
      console.error('你传入的方法名在actions没找到')
      return
    }
    return entry(this, payload)
  }
}
const install = (Vue) => {
  _Vue = Vue
  Vue.mixin({
    beforeCreate () {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  install,
  Store
}

```

### 水文总结

那今天的水文基本到此结束了，最后做个简单的小结，经过这篇文章的学习，我们手写了个`my-vuex.js`，具体细节如下

- `Vue.use(Vuex)` - 如何开发插件
  - `Store`类
  - `install`方法
- `state` - 如何做响应式
- `commit` - 如何找到对应的`mutation`做提交，**注意参数的处理以及`mutation`是同步的**
- `dispatch` - 如何找到对应的`action`做分发，**注意参数的处理以及`action`是异步的**
- `getters`(补充) - 如何处理`getters`和`computed`的转换

### 参考

- [vuex3.6.2](https://github.com/vuejs/vuex/tree/v3.6.2)
