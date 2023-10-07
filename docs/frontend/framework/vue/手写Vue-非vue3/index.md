---
outline: deep
---

# 手写Vue-非vue3

hello，大家好，我是梅利奥猪猪！就之前带大家手撸简易[VueRouter3](https://juejin.cn/post/7228407297604255781)和[Vuex3](https://juejin.cn/post/7229534559699615803)的那个！这次继续给大家带来干货，干货的主题就是手写个简易Vue(非vue3)，麻雀虽小五脏俱全，学完这个你将收获，面试时强大的气场！主要能学会以下知识点

* 手撕响应式
* 手撕简易编译器
* 手撕`Watcher`和`Dep`，知道他们如何建立关系

## 前置知识补充

众所周知，`vue`是个`mvvm`框架，这里就不做具体展开了，具体请看下图

![01-mvvm.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c52ba622cf54464b73c9f7788e3af77~tplv-k3u1fbpfcp-watermark.image?)

其中，图中的ViewModel对于我们来说，就像黑盒般的存在，他到底做了什么，让我们写vue，纵享丝滑，写的如此快乐轻松呢！这也就是此篇文章的目的，带大家来写个简易Vue，具体要实现的东西，也请看下图

![02-目标.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7003faf217347388a3e67cd1ae09bfa~tplv-k3u1fbpfcp-watermark.image?)

可能现在的你还看不懂，看上去好复杂啊，随着文章的深入，这幅图的所有实现都会带着大家写完！那我们开始吧

## 开始开发

### Observer - 数据劫持

#### defineReactive架子 - 测试拦截

大家都知道，Vue2的响应式原理是`Object.defineProperty`, 如果对`Object.defineProperty`的使用还不清楚想更深入的小伙伴，可以去看下[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)，这里直接跟着我写也行！

新建`my-vue.js`

```js
/* eslint-disable */ 
function defineReactive (obj, key, val) {
  Object.defineProperty(obj, key, {
    get () {
      console.log('get', { key, val })
      return val
    },
    set (newVal) {
      if (newVal !== val) {
        console.log('set', { key, newVal })
        val = newVal
      }
    }
  })
}

const obj = {}
defineReactive(obj, 'foo', 'foo')
obj.foo
obj.foo = 'new foo'

```

写完这个，我们可以测试下，用node环境跑下代码，会发现，的确get和set的时候都触发了打印！

![03-初次劫持数据.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e92e9b782824f399219a64301705303~tplv-k3u1fbpfcp-watermark.image?)

#### 放在一个测试页面并提供update方法测试

有了这个初步的劫持，那我们还可以玩什么呢，既然修改数据能触发set，那如果我在set里提供方法，更改视图会发生什么事呢！我们赶紧来试试！

cv前面的js代码到测试页面，修改下，添加update函数，之后在控制台修改对象的属性玩耍下！

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试数据劫持</title>
</head>

<body>
    <div id="app">
        <h1 id="a"></h1>
        <h1 id="b"></h1>
        <h1 id="c"></h1>
    </div>
    <script>
        function defineReactive(obj, key, val) {
            Object.defineProperty(obj, key, {
                get() {
                    console.log('get', { key, val });
                    return val
                },
                set(newVal) {
                    if (newVal != val) {
                        console.log('set', { key, newVal });
                        val = newVal
                        // 注意以下代码新增, 要写在赋值后面哈！
                        update()
                    }
                }
            })
        }
        const obj = {}
        // 添加3个属性
        defineReactive(obj, 'a', 'a')
        defineReactive(obj, 'b', 'b')
        defineReactive(obj, 'c', 'c')
        // 定义update函数，就做简单的页面视图更新
        function update () {
            a.innerHTML = obj.a
            b.innerHTML = obj.b
            c.innerHTML = obj.c
        }
        // 一进页面先调用下
        update()

    </script>
</body>

</html>
```

![04-控制台数据劫持玩耍.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17a2cdf006e348b1b716e1a1c8e4c6bd~tplv-k3u1fbpfcp-watermark.image?)

我们可以发现，只要控制台修改了数据，视图就更新了，接着我们分析下问题，有这么几个疑问

1. 在使用vue的时候，更新函数我们有写过吗

* 其实都是template自动编译成更新函数的

2. 劫持字段要用户一个一个自己去劫持，不合理

* 需要遍历，后面还需要递归(等等就讲)

3. 全量更新，只要数据一发生改变（改变其中一个属性），视图就直接全部更新了，显然不合理

* 精确定位具体的dom元素 - 本次简易版实现使用这种
* 利用虚拟dom差异化更新 - 以后带大家看源码，我会产出博客的！

#### observe的初步实现

用户不应该手动设置属性，通过遍历处理劫持每个key

```js
function observe (obj) {
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

const obj = {
  foo: 'foo',
  bar: 'bar'
}
// defineReactive(obj, 'foo', 'foo')
observe(obj)
obj.foo
obj.foo = 'new foo'
obj.bar
obj.bar = 'new bar'

```

![05-遍历劫持所有key.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53c73d31fd75482295ec40a76672a923~tplv-k3u1fbpfcp-watermark.image?)

#### 数据劫持需要递归处理

以上代码还没有递归，为什么要递归，因为用户设置的属性，还可以是对象，不递归会带来问题

```js
const obj = {
    a: 1,
    b: 2,
    c: {
        haha: 3
    }
}
obj.c.haha
obj.c.haha = 4
```

![06-不递归劫持不到里面的属性.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b193729bde704908bf637d3479bcc2c0~tplv-k3u1fbpfcp-watermark.image?)

上面的截图，能发现，并没有劫持到haha这个属性，所以`observe`方法中`defineReactive`的`obj[key]`如果是对象就需要递归

```js
function defineReactive (obj, key, val) {
  // 直接数据劫持，不用担心observe方法写了递归结束条件
  observe(val)
  ...
}

function observe (obj) {
  // 递归结束条件
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}
```

此时在跑前面的代码，就能劫持到我们想要的属性了

![07-递归后解决劫持问题.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0771e831af5a49a4bf71cd2f7f245a3a~tplv-k3u1fbpfcp-watermark.image?)

#### 劫持set函数里还要在observe，因为用户可能直接赋值新的对象

```js
obj.c = {
    heihei: 444
}

obj.c.heihei
obj.c.heihei = 555
```

如果给属性赋值了新对象，数据劫持还是会出现问题

![08-重新设置新的对象劫持出现问题.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7579532d2a32423b848819f181595909~tplv-k3u1fbpfcp-watermark.image?)

```js
        set(newVal) {
            if (newVal !== val) {
                // 需要劫持
                observe(newVal)
                val = newVal
            }
        }
```

在set添加observe后，此时效果就出来了

![09-在set方法里observe.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e335f0c84cd8458699a4e55470654caa~tplv-k3u1fbpfcp-watermark.image?)

#### set方法

给obj设置个新属性，会劫持吗

```js
const obj = {
    a: 1,
    b: 2,
}
observe(obj)
obj.c = 3
obj.c
obj.c = 4
```

![10-新加个属性不会劫持.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97d22d522dcd4a8dbeee3b687982948f~tplv-k3u1fbpfcp-watermark.image?)

所以Vue提供了set方法，新的属性就要新的劫持！

```js
// 手写，新增set方法
function set(obj, key, val) {
    defineReactive(obj, key, val)
}

const obj = {
    a: 1,
    b: 2,
}
observe(obj)
// 调用set方法
set(obj, 'c', 3)
// 这行就不需要了
// obj.c = 3
obj.c
obj.c = 4
```

![11-set方法实现及使用.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6eb8b87456c4207b1fdf2cbbe4d130d~tplv-k3u1fbpfcp-watermark.image?)

#### 数组问题

可以拦截的情况

```js
const arr = [1, 2, 3]
observe(arr)
arr[0]
arr[1] = 222
```

![12-数组可以劫持的情况.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8af0ca6f04d4e1e99d2e03e9f9e6515~tplv-k3u1fbpfcp-watermark.image?)

用户可能访问更大的索引，或者给数组添加删除等方法(会改变数组自身的方法)，此时就拦截不了, 数组7个变更方法处理会变更数组自身的方法，在做数组操作的同时，进行变更通知 此次不实现

![13-数组不能劫持的情况.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdd43fad356c4ddebf068bb79d790dab~tplv-k3u1fbpfcp-watermark.image?)

#### 写静态页面使用官方的vuejs

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        {{count}}
        <div>{{count}}</div>
        <p v-text="count"></p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script>
        const vm = new Vue({
            el: '#app',
            data: {
                count: 0
            }
        })
        setInterval(() => {
            vm.count++
        }, 1000)
    </script>
</body>

</html>
```

能发现页面中的count在不断变化，接下去我们要替换我们自己的my-vue.js

#### my-vue.js

首先报错了，我们可以这么处理

```js
class Vue {
  constructor (options) {
    // 0 - 保存选项
    this.$options = options
    this.$data = options.data
    // 1 - 响应式 - 写好点可以做判断因为可能传的是函数
    observe(this.$data)
    // 2 - 编译模板
  }
}
```

然后发现没有打印get和set，为什么没有劫持，因为vm上没有count，count在\$data上

```js
setInterval(() => {
    vm.$data.count++
}, 1000)
```

将代码从`vm.count++`改成`vm.$data.count++`就有对应的打印了

![14-数据在\$data上.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/452528c75dca46cd8748e51922eeec01~tplv-k3u1fbpfcp-watermark.image?)

#### 代理属性

前面的问题是因为app上是没有counter属性的，在\$data上才有counter属性，所以要做一层代理

在实现前，先闲扯一句，相当于现在有这么一个面试题

```js
const obj = {
  data: {
    a: 1,
    b: 2
  }
}
// 希望你可以通过以下方式访问到data中的a和b属性
obj.a
obj.b
// 希望你可以通过以下方式，可以修改data里a和b的值
obj.a = 11
obj.b = 22
```

实现的代码如下

```js
const obj = {
  data: {
    a: 1,
    b: 2
  }
}
Object.keys(obj.data).forEach(key => Object.defineProperty(obj, key, {
    get() {
        return obj.data[key]
    },
    set(val) {
        obj.data[key] = val
    }
}))
```

![15-控制台测试代理.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10461702c4cd45658d8a5f49b27a35b3~tplv-k3u1fbpfcp-watermark.image?)

通过以上练习，接下去对Vue实例代理一层是不是就简单多了！实现后就能看到`vm.count++`也能触发劫持效果

```js
// 简单代理一层
function proxy (vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm.$data[key]
      },
      set (v) {
        vm.$data[key] = v
      }
    })
  })
}

class Vue {
  constructor (options) {
    // 0 - 保存选项
    this.$options = options
    this.$data = options.data
    // 1 - 响应式
    observe(this.$data)
    // 2- 做代理
    proxy(this)
    // 3 - 编译模板
  }
}

```

至此，我们数据劫持相关的知识就先到这里，接下去就要开始写个简简单单的编译器

### Compile - 编译器

接下去做编译的部分

原理简单说明

* 获取dom
* 遍历childNodes
  * 编译节点
    * 遍历属性
      * v-开头
      * @开头
  * 编译文本

#### Compile类

我们先简单搭个架子，Compile类，构造函数需要传入一开始设置的el选项以及vm实例(后面会用到)，通过el选择器，获取元素，在调用编译方法！（compile方法用于处理编译的逻辑）具体代码如下

```js
class Vue {
    constructor(options) {
        // console.log(options);
        this.$options = options
        this.$data = options.data
        observe(this.$data)
        proxy(this)
        // 将选择器和实例都传入
        new Compile(options.el, this)
    }
}

class Compile {
    constructor(elSelector, vm) {
        this.vm = vm
        const element = document.querySelector(elSelector)
        // console.log(element, this.$vm);
        this.compile(element)
    }
    compile(element) {
        // 这里不能用children要用childNodes
        // console.log(element.children);
        // console.log(element.childNodes);
        const childNodes = element.childNodes
        console.log(childNodes);
    }
}

```

可以给各位小伙伴一个思考，为什么编译方法里获取的是childNodes而不是children，基础好的小伙伴应该猜到了！因为children只能获取元素，但childNodes可以获取节点

![16-children和childNodes区别.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e3e467189b44e9fa597b6aa67c9a883~tplv-k3u1fbpfcp-watermark.image?)

#### 判断元素还是文本

这里的知识相对容易，首先要知道的nodeType的值，可以查看[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType)，其中文本节点，我们还要判断是否有双大扩号语法，所以要用到正则，具体代码如下

```js
  // 是否元素
  isElement (node) {
    return node.nodeType === 1
  }
  // 文本
  isInter (node) {
    // nodeType在mdn查询 正则可以在浏览器里调试 RegExp.$1
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
```

#### 打印节点相关内容

接着遍历childNodes，使用前面的判断方法，做些打印

```js
  compile(element) {
    
    const childNodes = element.childNodes;
    // console.log(childNodes);
    childNodes.forEach(node => {
        // console.log(node.nodeName, node.nodeType);
        if (this.isElement(node)) {
            console.log('element',node.nodeName);
            // 如果是元素 还需要递归
        } else if (this.isInter(node)) {
            // 文本
            console.log('inter', node.textContent);
        }
    })
  }
```

![17-打印元素和节点.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bbf8316b0f34e589d1c040d87d6d9b4~tplv-k3u1fbpfcp-watermark.image?)

#### 元素节点需要递归处理

元素节点里还有文本节点，所以要做递归处理

```js
if (this.isElement(node)) {
    console.log('element', node.nodeName)
    if (node.childNodes.length > 0) {
        // 元素节点里还有节点，那递归遍历
        this.compile(node)
    }
} 
```

![18-递归获取双大括号文本节点.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a07a626b3224654941ab52de565b9c7~tplv-k3u1fbpfcp-watermark.image?)

#### 编译text节点

实现compileText(不要忘记加trim，还有这里简易实现没有考虑文本节点里复杂的逻辑)，并在判断文本节点的地方调用这个方法

```js
  compileText (node) {
    // 不要忘记trim 可能双大扩前后加了空格
    node.textContent = this.vm[RegExp.$1.trim()]
  }
```

```js
else if(this.isInter(node)) {
    console.log('inter', node.textContent);
    this.compileText(node)
}
```

![19-简易编译文本节点.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2958af236a0d4e0189ce634449003635~tplv-k3u1fbpfcp-watermark.image?)

#### 元素节点解析指令

元素先要解析他的属性

```js
if (this.isElement(node)) {
    // console.log('element', node.nodeName)
    const attrs = node.attributes; // 新增代码
    console.log(attrs); // 新增代码
    if (node.childNodes.length > 0) {
        // 递归处理
        this.compile(node)
    }
}
```

![20-打印元素上的属性.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e46285f846448edb8c16c63ed2f2c7e~tplv-k3u1fbpfcp-watermark.image?)

接着遍历attrs，注意了他是个伪数组，所以先要转成真数组，在遍历！遍历后`console.dir`打印下`attr`

```js
[...attrs].forEach(attr => {
    console.dir(attr)
})
```

![21-dir打印attr.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c079b45049b499b810f17d76f010aa0~tplv-k3u1fbpfcp-watermark.image?)

我们知道了`attr`上有`name`和`value`属性，那接下去，我们就解构加起别名处理下！

```js
const attrs = node.attributes;
  // console.log(attrs);
  [...attrs].forEach(({name: attrName, value: exp}) => {
      console.log(attrName, exp)
  })
```

#### 判断是否是指令

判断是否是指令，只要判断字符串开始是否有`v-`就可以

```js
isDir (str) {
  return str.startsWith('v-')
}
```

#### 每个指令提供一个方法

text方法实现

```js
  text (node, exp) {
    console.log('text方法', node, exp);
    node.textContent = this.vm[exp]
  }
```

v-text就调用text方法（v-html就调用html方法等）

```js
if (this.isDir(attrName)) {
    // console.log('是指令', attrName, '表达式为', exp);
    const dirName = attrName.slice(2)
    // console.log(dirName);
    this[dirName]?.(node, exp)
}
```

![22-text指令解析成功.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/502166af611241528de185371cbb5648~tplv-k3u1fbpfcp-watermark.image?)

思考：小伙伴们可以自行完成`v-html`指令试试哈，后面还会带大家实现`v-model`，还有事件`@click`等等

至此，解析指令，初始化视图，一个简易的编译器就写完了

### Watcher - 观察者

* vue的实现：模板 => vdom => dom

* 本次实现跳过虚拟dom，简易的实现（其实是Vue1的实现）

* 观察者模式不理解的，可以自行补充该知识哈，或者看下以下这个扎心的例子

```js
class ProductManager {
    constructor () {
        this.workers = []
    }
    addWorker (...worker) {
        this.workers.push(...worker)
    }
    notify (prd) {
        this.workers.forEach(item => {
            item.update(prd)
        })
    }
}
class Worker {
    constructor(name) {
        this.name = name
    }
    update(prd) {
        console.log(prd + `需求来了，${this.name}准备996`);
    }
}

const pm = new ProductManager()
const frontWorker = new Worker('前端')
const endWorker = new Worker('后端')
const testWorker = new Worker('测试')
pm.addWorker(frontWorker, endWorker, testWorker)
pm.notify('一个复杂的功能')
```

此例子模拟了产品发布一个复杂的功能，只要`setPrd`就通知了所有人员一起干活！

#### 依赖收集

视图中会用到data中的某key，这称为依赖，同一个key可能出现多次，每次都需要收集出来用一个Watcher来维护他们，此过程称为依赖收集

多个Watcher需要一个Dep来管理（vue的最终实现是多对多的关系），需要更新时由Dep统一通知，接下去说明下关系

```html
<div>
    <p>{{name1}}</p>
    <p>{{name2}}</p>
    <p>{{name1}}</p>
</div>
```

收集依赖 有几个大括号就有几个watcher 所以这里有3个watcher

有几个key就有几个管家dep 所以dep只有2个,

**Dep1 deps = \[watcher1, watcher3]**

**Dep2 deps = \[watcher2]**

实现思路

1. defineReactive时为每一个key创建一个Dep实例
2. 初始化视图时读取个key 创建一个watcher 比如name1 就创建个watcher1
3. 触发name1的getter方法，将watcher1添加到name1对应的Dep中
4. 当name1更新，setter触发时，通过对应Dep通知管理所有Watcher更新

源码是N对N 这里我们简化下Dep和watcher 1对N

那接下来搭架子， 我们要了解watcher具体要干什么，请看以下代码及注释

```js
/**
 * 负责具体节点更新
 * Watcher的用法是是用来更新数据的 vm[exp]可以拿到对应的数据，在通过val修改，这里第三个参数传递方法
 * new Watcher(vm, exp, (val) => {})
 */
class Watcher {
    constructor(vm, key, updater) {
        this.vm = vm;
        this.key = key
        this.updater = updater
    }
    // 给管家调用
    update () {
        this.updater(this.vm[this.key])
    }
}


```

#### watcher实例化前准备工作

只要涉及到编译的地方都要`new Watcher`

watcher在什么时候实例化，编译的时候实例化，只要有动态绑定的就实例化!比如text方法，compileText方法等，因为他们都要解析动态绑定的值,所以我们需要重构下Compile类，提供更高级的方法

为了复用，可以提供textUpdater，他做的事情就是给节点赋值内容

除了textUpdater,以后可能有其他的xxxUpdater，所以可以提供一个统一的`update`方法，
`update`函数的形参为`node`, `exp`, `dir`，分别指的是节点，表达式，哪一种指令(之后调用哪种Updater)

```js
  // 处理所有动态绑定
  update(node, exp, dir) {
    // 1. 初始化
    this[dir + 'Updater']?.(node, this.vm[exp])
    // 2. 创建Watcher实例，负责后续管理
  }
  textUpdater(node, val) {
    // console.log(node, val);
    node.textContent = val
  }
  text (node, exp) {
    // console.log('text方法', node, value);
    // node.textContent = this.vm[value]
    this.update(node, exp, 'text')
  }
  compileText (node) {
    // node.textContent = this.vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
  }
```

小伙伴们还可以自己实现下htmlUpdater和html，看下初始化功能是否ok

#### 实例化watcher

实例化Watcher

```js
  update(node, exp, dir) {
    // 1. 初始化
    this[dir + 'Updater']?.(node, this.vm[exp])
    // 2. 创建Watcher实例，负责后续管理, 一定要用箭头函数否则this指向有问题
    new Watcher(this.vm, exp, (val) => {
        this[dir + 'Updater']?.(node, val) 
    })
  }
```

#### 简单粗暴全量更新

简单粗暴全量更新，声明一个全局的watchers，在实例化Watcher的时候，就添加watcher，最后在劫持的set里调用update方法

```js
const watchers = []
function defineReactive (obj, key, val) {
  // 直接数据劫持，不用担心observe方法写了递归结束条件
  observe(val)
  Object.defineProperty(obj, key, {
    get () {
      // 形成闭包
    //   console.log('get', { key })
      return val
    },
    set (newVal) {
      if (newVal !== val) {
        // 形成闭包
        // console.log('set', { key })
        // console.log(watchers)
        observe(newVal)
        val = newVal
        watchers.forEach(w => w.update())
      }
    }
  })
}


class Watcher {
    constructor(vm, key, updater) {
        this.vm = vm;
        this.key = key
        this.updater = updater
        watchers.push(this)
    }
    // 给管家调用
    update () {
        this.updater(this.vm[this.key])
    }
}
```

此时效果已经出来了，已经能看到页面能不断更新了，（前面定时器的原因不断累加），但我们实现还不够完美，还要处理下管家Dep

#### 处理Dep

把前面粗暴的代码删了

```js
class Dep {
    constructor() {
        this.subs = []
    }
    addSub (sub) {
        // sub就是watcher
        this.subs.push(sub)
    }
    notify () {
        this.subs.forEach(sub => sub.update())
    }
}
```

#### 难点-如何建立Watcher和Dep的关系

* 之前说了，一个key对应一个管家，所以在defineReactive中，实例化Dep
* 实例化后的Watcher什么时候添加进管家的subs，这里有个巧妙的方式
  * 实例化后Watcher挂在Dep.target上
  * 手动取值触发下劫持的get函数
  * 最后Dep.target清空
* 何时通知所有的watcher
  * 在set的时候，当前dep直接notify

核心代码如下

```js
function defineReactive (obj, key, val) {
    // 新增实例化Dep
    const dep = new Dep()
    observe(val)
    Object.defineProperty(obj, key, {
        get () {
            // 新增 - 添加watcher
            Dep.target && dep.addSub(Dep.target)
            return val
        },
        set(newVal) {
            if (newVal != val) {
                // console.log('set', {key, newVal});
                observe(newVal)
                val = newVal
                // 新增 - 通知所有watcher更新
                dep.notify()
            }
        }
    })
}

class Watcher {
    constructor(vm, key, updater) {
        this.vm = vm;
        this.key = key;
        this.updater = updater
        // 以下三行代码新增
        Dep.target = this // 实例化watcher挂在Dep.target上
        this.vm[this.key] // 手动触发劫持的get
        Dep.target = null // 触发完将Dep.target清空
    }
    update () {
        this.updater(this.vm[this.key])
    }
}

```

至此整个简易的vue就实现好了，在来回看之前的那个图，我们在分析下

![23-分析开局的图.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82d70dbcb9f5495e92f3553a92c61f2d~tplv-k3u1fbpfcp-watermark.image?)

完结撒花！

### 补充

#### 数组变异方法 - 了解

* 目前数组是无法感知有变化的

```js
const arr = [1, 2, 3]
observe(arr)
arr.push(4, 5)
arr[3] = 444
arr[4] = 555
```

* 实现数组响应式

  * 找到数组原型
  * 覆盖修改数组的更新方法

    ```js
    // 原先的
    const arrayProto = Array.prototype
    // 备份一份
    const arrayMethods = Object.create(arrayProto)
    const methodsToPatch = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
    methodsToPatch.forEach(method => {
        const original = arrayProto[method]
        arrayMethods[method] = function () {
            // 执行原先的
            const result = original.apply(this, args)
            // 处理覆盖的逻辑
            console.log('变异方法开始', method);
            // ...
            return result
        }
    })
    ```

  * 在observe方法中做判断，是数组的话将得到的新的原型设置到数组实例原型上

    ```js
    function observe(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }
        if (Array.isArray(obj)) {
            obj.__proto__ = arrayMethods
            for (let i = 0; i < obj.length; i++) {
                const item = obj[i];
                observe(item)
            }
        } else {
            Object.keys(obj).forEach(key => {
                defineReactive(obj, key, obj[key])
            })
        }
    }
    ```

#### 编译器@事件实现

```js
if (this.isEvent(attrName)) {
    // console.log(attrName, exp);
    const eventName = attrName.slice(1)
    // console.log(eventName, exp);
    this.eventHandler(node, eventName, exp)
}


eventHandler(node, eventName, exp) {
    const fn = this.vm.$options?.methods?.[exp]
    node.addEventListener(eventName, fn.bind(this.vm))
}
isEvent(str) {
    return str.indexOf('@') === 0
}
```

#### 编译器 v-model实现

```js
    modelUpdater(node, val) {
        node.value = val
    }
    model(node, exp) {
        // update方法只完成赋值和更新
        this.update(node, exp, 'model')
        // 事件监听
        node.addEventListener('input', e => {
            this.vm[exp] = e.target.value
        })
    }
```

## 总结

### 完整代码

```js
// 先不用dep做测试，只要实例化Watcher 就添加进数组，并且在劫持set的时候，直接更新
// const watchers = []
function defineReactive(obj, key, value) {
    // 实例化管家 管家里有2个方法，一个是addDep 还有一个notify
    const dep = new Dep()
    observe(value)
    Object.defineProperty(obj, key, {
        get() {
            // console.log('get', { key, value });
            if (Dep.target) {
                // dep.addSub(watcher实例)
                dep.addSub(Dep.target)
            }
            return value
        },
        set(newValue) {
            if (newValue !== value) {
                observe(newValue)
                // console.log('set', {key, newValue});
                value = newValue
                // watchers.forEach(item => item.update())
                dep.notify()
            }
        }
    })
}

function observe (obj) {
    // 递归要注意 终止条件 判断不是对象 或者是null 就return 
    if(typeof obj !== 'object' || obj === null) return
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

// set方法 劫持新的属性
function set(target, key, value) {
    defineReactive(target, key, value)
}


function proxy (vm) {
    // console.log(vm);
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(val) {
                vm.$data[key] = val
            }
        })
    })
}

class Vue {
    constructor(options) {
        // console.log(options);
        // $options
        this.$options = options
        // $data 判断data是对象还是函数 函数执行取返回值
        this.$data = options.data
        // data数据是响应式的
        observe(options.data)
        // 代理 希望
        // 访问 vm.count => vm.$data.count
        // 修改 vm.count++ => vm.$data.count++
        proxy(this) // this在这里就是实例 就是vm
        new Compile(options.el, this)
    }
}

// 解析模板
class Compile {
    // el（要知道解析哪个模板）和vm实例（要获取里面数据data还有方法methods等）
    constructor(elSelector, vm) {
        // console.log(elSelector, vm);
        // 把vm实例挂载this上，方便后面获取
        this.vm = vm
        // 选择器 获取 对应的元素
        const element = document.querySelector(elSelector)
        // 新写方法compile，参数传入元素，该方法专门处理编译解析
        this.compile(element)
    }
    compile(element) {
        // console.log(element, this.vm);
        // children只能拿到子元素，不能用这个方案，因为除了元素还有文本，文本有双大括号需要解析
        // console.log(element.children);
        // console.log(element.childNodes);
        element.childNodes.forEach(node => {
            // nodeType === 1 元素节点
            // nodeType === 3 文本节点
            // console.log(node, node.nodeType);
            if (this.isElement(node)) {
                // console.log('元素', node);
                const attrs = node.attributes
                // console.log([...attrs]);
                Array.from(attrs).forEach(({name: attrName, value: exp}) => {
                    // console.dir(attr)
                    // name - 属性名 - 键
                    // value - 属性值 - 值
                    // console.log(attrName ,exp);
                    if (this.isDir(attrName)) {
                        // console.log('需要解析指令 指令名',attrName);
                        const dirName = attrName.slice(2)
                        // console.log(dirName);
                        // console.log('需要解析指令 表达式',exp);
                        /**
                         * 每个指令提供一个方法
                         * v-text -> 调用text方法  text(node, exp)
                         * v-html -> 调用html方法 html(node, exp)
                         */
                        // 以下代码不能这么写，因为text写死了
                        // this.text(node, exp)
                        // dirName就动态的
                        this[dirName]?.(node, exp)
                    }
                })
                if (node.childNodes.length > 0) {
                    // 递归处理
                    this.compile(node)
                }
            }
            if (this.isInter(node)) {
                // 能进这个if 说明是文本并且里面有双大括号
                // console.log('文本', node);
                this.compileText(node)
            }
        })
    }
    isElement (node) {
        return node.nodeType === 1 
    }
    // 是文本节点，且里面有双大扩号语法 （正则） （node节点里的内容 正则匹配）
    // 判断有双大括号语法的文本
    isInter (node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    // direction isDir - 判断个字符串是否是指令 (指令都是v-开头)
    // 如何判断一个字符串是v-开头呢 startsWith
    isDir (str) {
        return str.startsWith('v-')
    }
    update (node, exp, dir) {
        // this.textUpdater(node, this.vm[exp])
        // 初始化的工作
        this[dir + 'Updater']?.(node, this.vm[exp])
        // 实例化Watcher 做监听，做数据变化之后的一些功能
        new Watcher(this.vm, exp, val => {
            // console.log(this);
            // val指的是最新的值
            this[dir + 'Updater']?.(node, val)
        })
    }
    // xxxUpdater
    // yyyUpdater
    textUpdater (node, val) {
        node.textContent = val 
    }
    htmlUpdater (node, val) {
        node.innerHTML = val
    }
    // 编译文本
    /**
     * 简易版 直接替换双大扩号语法内容
     * 复杂版的逻辑 本次不考虑 有兴趣的可以自己扩展
     * {{ 1 + count}} 双大括号里复杂的逻辑 本次不考虑
     * {{count}} {{haha}} {{heihei}} 一个文本节点中有多个双大括号 本次也不考虑
     * xxxx {{xxx}} 文案加双大括号 本次也不考虑
     * @param {*} node 
     */
    compileText(node) {
        // (haha) => ( haha )
        // console.log('compileText', node, RegExp.$1, this.vm);
        // node.textContent = this.vm[RegExp.$1.trim()]
        // new Watcher()
        this.update(node, RegExp.$1.trim(), 'text')
    }
    text (node, exp) {
        // node.textContent = this.vm[exp]
        // new Watcher()
        this.update(node, exp, 'text')
    }
    html (node, exp) {
        // node.innerHTML = this.vm[exp]
        // new Watcher
        this.update(node, exp, 'html')
    }
}

class Watcher {
    // new Watcher(vm, key, updater函数)
    // new Watcher(vm, key, val => {渲染的逻辑})
    // 有值就能做渲染 node.textContent = vm[key]
    constructor(vm, key, updater) {
        this.vm = vm;
        this.key = key;
        this.updater = updater
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
        // watchers.push(this)
    }
    // dep通知所有对应的watcher 遍历执行update
    update () {
        // 执行updater函数就可以了
        this.updater(this.vm[this.key])
    }
}

class Dep {
    constructor() {
        this.subs = [] // watcher数组
    }
    // 添加watcher
    addSub (sub) {
        this.subs.push(sub)
    }
    // 通知对应的watchers里的每一个观察者做更新
    notify () {
        this.subs.forEach(item => item.update())
    }
}


```

### 简易Vue分析

vue1的实现基本就是这样，vue2用虚拟dom是因为vue1带来的问题，这次实现，模板中每有一个变量就有一个watcher,明显不合理！ 所以vue2后面一个组件一个watcher，但他怎么知道要更新具体哪个呢，所以有了虚拟dom的概念，这也是引进来虚拟dom的必要性
