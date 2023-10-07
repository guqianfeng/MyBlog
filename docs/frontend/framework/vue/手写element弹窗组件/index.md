---
outline: deep
---

# 手写element弹窗组件

小伙伴们，你们好呀！今天帅峰继续给你们带来`element`弹窗组件封装的实操

注意：element，非plus，这次我们参考`element`源码，实现简易版的弹窗组件

## 能学到什么

- 学会组件库例如弹窗组件，函数调用就有弹窗了到底是怎么实现的！

- Vue.extend(xxx)这在干什么？
- 创建实例时怎么传递 props？
- $mount()不传参数执行空挂载？
- $destroy()这个是干什么的？

是不是激动到搓手手了！让我们开始吧

## 弹窗组件介绍及源码参考

弹窗这类组件特点是他们在当前vue实例之外独立存在，通常挂载于body；他们是通过js动态创建的，不需要在任何组件中声明(Vue3有传送门，但Vue2没有)

我们通常直接在组件里调用`this.$xxx()`就可以用了，那这东西到底是怎么实现的，怎么玩的呢？

这种函数调用我们之前就没做封装，所以当我们不会的时候就可以参考下`element`的源码

为什么我们能在组件内`this.$xxx()`调用，答案肯定只有一个，挂载到了原型上！所以顺藤摸瓜，可以找到入口文件

在入口文件里，插件的实现代码核心`install`方法中，我们发现了在原型上挂了我们经常使用的`this.$message`，`this.$notice`等，代码如下

```js
  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;
```

接下去我们就可以看下，给他们赋值的`Message`，`Notification`到底是什么，这里我就以`Message`举例，mac小伙伴通过鼠标左键加`cmd`(windows小伙伴是`ctrl`)点击`Message`，就可以在`packages/message/src/main.js`看到核心的实现了，这里先把代码贴着，后续我们还会看具体的一些实现

```js
// packages/message/src/main.js
import Vue from 'vue';
import Main from './main.vue';
import { PopupManager } from 'element-ui/src/utils/popup';
import { isVNode } from 'element-ui/src/utils/vdom';
import { isObject } from 'element-ui/src/utils/types';
let MessageConstructor = Vue.extend(Main);

let instance;
let instances = [];
let seed = 1;

const Message = function(options) {
  if (Vue.prototype.$isServer) return;
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options
    };
  }
  let userOnClose = options.onClose;
  let id = 'message_' + seed++;

  options.onClose = function() {
    Message.close(id, userOnClose);
  };
  instance = new MessageConstructor({
    data: options
  });
  instance.id = id;
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }
  instance.$mount();
  document.body.appendChild(instance.$el);
  let verticalOffset = options.offset || 20;
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16;
  });
  instance.verticalOffset = verticalOffset;
  instance.visible = true;
  instance.$el.style.zIndex = PopupManager.nextZIndex();
  instances.push(instance);
  return instance;
};

['success', 'warning', 'info', 'error'].forEach(type => {
  Message[type] = (options) => {
    if (isObject(options) && !isVNode(options)) {
      return Message({
        ...options,
        type
      });
    }
    return Message({
      type,
      message: options
    });
  };
});

Message.close = function(id, userOnClose) {
  let len = instances.length;
  let index = -1;
  let removedHeight;
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      removedHeight = instances[i].$el.offsetHeight;
      index = i;
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i]);
      }
      instances.splice(i, 1);
      break;
    }
  }
  if (len <= 1 || index === -1 || index > instances.length - 1) return;
  for (let i = index; i < len - 1 ; i++) {
    let dom = instances[i].$el;
    dom.style['top'] =
      parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px';
  }
};

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

export default Message;

```

其实这个代码并不算长，我们先看该文件开头的一些代码，注意到了，他`import`了弹窗类的组件，代码如下

```js
...
// 等等看下main组件的实现，说明写弹窗类的组件还是要先写sfc！
import Main from './main.vue';
...
```

接下去看下Main组件的实现，路径在`packages/message/src/main.vue`

```jsx
<template>
  <transition name="el-message-fade" @after-leave="handleAfterLeave">
    <div
      :class="[
        'el-message',
        type && !iconClass ? `el-message--${ type }` : '',
        center ? 'is-center' : '',
        showClose ? 'is-closable' : '',
        customClass
      ]"
      :style="positionStyle"
      v-show="visible"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      role="alert">
      <i :class="iconClass" v-if="iconClass"></i>
      <i :class="typeClass" v-else></i>
      <slot>
        <p v-if="!dangerouslyUseHTMLString" class="el-message__content">{{ message }}</p>
        <p v-else v-html="message" class="el-message__content"></p>
      </slot>
      <i v-if="showClose" class="el-message__closeBtn el-icon-close" @click="close"></i>
    </div>
  </transition>
</template>

<script type="text/babel">
  const typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };

  export default {
    data() {
      return {
        visible: false,
        message: '',
        duration: 3000,
        type: 'info',
        iconClass: '',
        customClass: '',
        onClose: null,
        showClose: false,
        closed: false,
        verticalOffset: 20,
        timer: null,
        dangerouslyUseHTMLString: false,
        center: false
      };
    },

    computed: {
      typeClass() {
        return this.type && !this.iconClass
          ? `el-message__icon el-icon-${ typeMap[this.type] }`
          : '';
      },
      positionStyle() {
        return {
          'top': `${ this.verticalOffset }px`
        };
      }
    },

    watch: {
      closed(newVal) {
        if (newVal) {
          this.visible = false;
        }
      }
    },

    methods: {
      handleAfterLeave() {
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },

      close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose(this);
        }
      },

      clearTimer() {
        clearTimeout(this.timer);
      },

      startTimer() {
        if (this.duration > 0) {
          this.timer = setTimeout(() => {
            if (!this.closed) {
              this.close();
            }
          }, this.duration);
        }
      },
      keydown(e) {
        if (e.keyCode === 27) { // esc关闭消息
          if (!this.closed) {
            this.close();
          }
        }
      }
    },
    mounted() {
      this.startTimer();
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    }
  };
</script>

```

这和我们平时封装组件不是一模一样嘛，可以先大致扫下逻辑

我们可以看下`handleAfterLeave`方法，他主要就是在组件过渡动画结束后（即控制逻辑隐藏）会触发！方法里执行了`$destroy`（这个方法不会，不知道干什么用的时候怎么办！看官网），紧接着的代码`removeChild`移除了自身

```js
handleAfterLeave() {
  this.$destroy(true);
  this.$el.parentNode.removeChild(this.$el);
},
```

接下去重点看下核心控制显示隐藏的逻辑`v-show="visible"`，这个就是控制Message组件的显示和隐藏的，但在这个文件中，隐藏的逻辑我们能找到，但我们并找不到，何时将`visible`改成`true`，让组件显示出来的逻辑代码，那他在哪里控制逻辑将message组件显示出来呢！答案就在`packages/message/src/main.js`，接下去我就整理下核心的一些实现，大家看下

```js
...
// 拿到构造函数 extend的用法，extend不会也看文档
let MessageConstructor = Vue.extend(Main);
let instance;
const Message = function(options) {
  // 实例化
  instance = new MessageConstructor(...);
  // 空挂载，为什么要空挂载呢？不会当然继续看官网
  instance.$mount();
  // 在body中添加dom元素，前面空挂载后可以在$el上就有dom元素了
  document.body.appendChild(instance.$el);
  // visible改成true，看到了没！message显示出来了吧
  instance.visible = true;
  // 返回实例
  return instance;
};
...
```

那看完源码分析后我们就可以搭下架子，我们之后的实现就是参考这个做的！

## 搭架子-Notice组件准备及初步使用方式约定

SfNotice组件

```vue
<template>
  <div v-if="isShow">
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '默认标题'
    },
    message: {
      type: String,
      default: '默认消息'
    },
    duration: {
      type: Number,
      default: 1000
    }
  },
  data () {
    return {
      isShow: false
    }
  },
  methods: {
    show () {
      this.isShow = true
      setTimeout(this.hide, this.duration)
    },
    hide () {
      this.isShow = false
      // 注意啦，该组件里有remove方法吗
      this.remove?.()
    }
  }
}
</script>

<style>
</style>

```

像类似这样的组件，我们使用上，不会再其他组件里声明注册，肯定是函数调用的方式，初步使用方式约定

```js
this.$create(Notice, {
    title: '温馨提示',
    message: '这里是内容',
    duration: 1000
}).show()
```

## 提供工具方法-create.js

```js
// utils/create.js
// 传入组件，并执行挂载到body
export default function (Comp, props) {
  // 1.组件实例化
  // 2.组件挂载到body
  // 3.组件删除方法
  // 4.返回实例
}

```

实现后代码如下

```js
import Vue from 'vue'
// 传入组件，并执行挂载到body
export default function (Comp, props) {
  const Ctor = Vue.extend(Comp)
  const comp = new Ctor({
    propsData: props
  })
  // 2.挂载到body
  //   comp.$mount(document.body) // 不能这么处理，body会被替换
  comp.$mount() // 挂载空,手动地挂载一个未挂载的实例。$el属性和真实元素就有了联系
  document.body.appendChild(comp.$el)
  // 3.组件删除方法
  comp.remove = () => {
    comp.$destroy()
    document.body.removeChild(comp.$el)
  }
  // 4.返回实例
  return comp
}

```

### 初步使用

要导入create 还要导入Notice组件 不要忘记调用实例上的show方法

```js
create(SfNotice, {
  title: '你好啊',
  message: '校验失败呀',
  duration: 2000
}).show()
```

我们希望最终的使用方式应该是这样的

```js
this.$notice({
    title: '你好啊',
    message: '校验失败呀',
    duration: 2000 
})
```

### 进一步改写

在main.js中提供$notice方法

```js
Vue.prototype.$notice = function (opts) {
  const comp = create(SfNotice, opts)
  comp.show()
  return comp
}
```

之后再所有其他组件就都可以`this.$notice`了，恭喜大家就完成了此次弹窗组件封装的任务

### 效果演示

[](./弹窗组件实现截图/01-show-notice.gif)

完结撒花！

## 总结

- 学会组件库例如弹窗组件，函数调用就有弹窗了到底是怎么实现的！
  - 源码中原型上挂载方法，实例化组件，修改visible属性让其显示
  - 隐藏逻辑在过渡动画离场后，触发函数，销毁实例并移除元素
- Vue.extend(xxx)这在干什么？
  - 使用基础 Vue 构造器，创建一个“子类”，获取构造函数
- 创建实例时怎么传递 props？
  - propsData只用于 new 创建的实例中。
- $mount()不传参数执行空挂载？
  - 如果 Vue 实例在实例化时没有收到 el 选项，则它处于“未挂载”状态，没有关联的 DOM 元素。可以使用 vm.$mount() 手动地挂载一个未挂载的实例。
- $destroy()这个是干什么的？
  - 完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器
