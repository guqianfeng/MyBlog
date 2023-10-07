---
outline: deep
---

# 手写element表单组件

hello，大家好，我是梅利奥猪猪（帅峰）！是一位持续进步喜欢分享知识的讲师！好久没更新博客了，这次一如既往的带给大家干货，一起手写简易版`element-ui`的组件之表单组件`el-form`，`el-form-item`，`el-input`！通过这篇文章的学习，大家肯定能变得更强，让我们开始吧！

注意了，本次实现是`element-ui`，非plus，所以用的是vue2！

## 需求分析

那在做之前肯定要先分析下大家熟练掌握的表单组件，是如何用的，简易版主要实现以下几点即可

- sf-form

  - 载体，输入数据model，校验规则rules
  - form实例上有校验validate函数

- sf-item

  - label标签添加
  - 载体，输入项包装
  - 校验执行者，显示错误

- sf-input

  - 双绑
  - 触发校验

是不是很熟悉，掌握手写他们后，我们能更进一步深入了解，之前的表单校验四要素，为什么要写他们！接着我们从最里面那层`input`组件开始写起！

## sf-input

### 双绑

众所周知，我们使用个`input`组件，就会这么使用，代码如下

`<sf-input v-model="form.username"></sf-input>`

本质就是实现`:value`和`@input`

SfInput.vue实现如下

```jsx
<template>
  <div>
    <input :value="value" @input="onInput">
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

在playground使用SfInput组件

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username"></sf-input>
    {{ form.username }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![01-input-v-model](./表单组件实现截图/01-input-v-model.gif)

这样一个最简单的双向数据绑定就完成了

### placeholder处理

在学这个知识之前，不知道大家知不知道vue2里的`$attrs`和`$listeners`，不知道可以自己补课下哈！我们会用到`$attrs`这个知识

使用上，我们肯定希望在组件上直接加上placeholder，就可以使用了，代码如下
`<sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>`

但加好`placeholder`这个属性之后以后发现了个问题！

![02-root-attr](./表单组件实现截图/02-root-attr.jpg)

原因是因为，我们在组件上写的属性，组件默认会继承，在组件的根元素加上这个属性，那该怎么办呢，只要在组件内加上选项`inheritAttrs: false`，根元素上就不会继承这个属性了！

但最后我们的目的是把placeholder加到哪里？加载input元素上！以往我们可能就会使用父传子了，但这里可以使用`$attrs`，请看官方文档的这段解释

> 包含了父作用域中不作为 prop 被识别 (且获取) 的 attribute 绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件——在创建高级别的组件时非常有用。

SfInput的实现如下

```vue
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

![03-$attrs](./表单组件实现截图/03-$attrs.jpg)

完美轻松搞定，那如果此时在写个密码的input框，`type="password"`，小伙伴们你们说会怎么样？属性依然可以透传，效果还是杠杠的

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
    {{ form.username }}
    <sf-input type="password" v-model="form.password" placeholder="请输入密码"></sf-input>
    {{ form.password }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![04-$attrs-power](./表单组件实现截图/04-$attrs-power.jpg)

好，那我们的`input`组件就先写到这里

## sf-form-item

前面实现了`input`，接下去我们要来实现包在他外面那一层的`form-item`

### 搭架子

先思考下我们是怎么用

```vue
<sf-form-item label='用户名'>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
</sf-form-item>
```

如果传了`label`会显示`label`，如果没传就不显示！还有就是`input`组件怎么渲染出来，不就是默认插槽吗！

所以接下去就简单实现下这个效果

```vue
<template>
<div>
    <!-- 判断label有没有 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>

</style>

```

接着在playground就这么用

```jsx
<sf-form-item label="用户名">
  <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
  {{ form.username }}
</sf-form-item>
<sf-form-item label="密码">
  <sf-input
    type="password"
    v-model="form.password"
    placeholder="请输入密码"
  ></sf-input>
  {{ form.password }}
</sf-form-item>
```

![05-form-item-label](./表单组件实现截图/05-form-item-label.jpg)

label就完美处理好了！

### 错误信息

接下去我们考虑下之前校验失败在输入框下面有报错信息，这个报错信息怎么来的？应该是我们`rules`里配置了`message`信息对吧，然后校验没通过就显示！但不管怎么样，`error`的数据不是我们直接传给`form-item`组件的，他不是对外暴露的，即不是用户传`error`进来的，而是组件自己的状态

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  }
}
</script>

<style>

</style>

```

至于校验的实现，等我们完整的架子搞定了在去处理

## sf-form

### 结构

我们之后希望是这么使用的

```jsx
    <sf-form>
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
      </sf-form-item>
    </sf-form>
```

他就是个简单的容器，直接提供插槽即可

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>

```

试下功能依然没问题可以运行，`form`组件的架子其实就这么简单！我们在后面再处理父传子`model`和`rules`，以及难点，实现一个整体表单校验的`validate`函数

## 校验处理

### 思考问题

校验什么时候触发？input表单框输入内容变化了就触发（简易版就input事件触发，就校验）

如何校验？input组件直接在自己这里`emit('validate')`吗？我们好像没有在input组件上写过`@validate`吧

源码中是每个form-item实现了validate函数，就是对其每一项表单项输入做校验。那input如何去通知form-item去调用validate函数呢

### 初步搭架子

经过前面的分析，所以我们接下去要在form-item里要提供validate方法

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
```

在input的onInput方法里emit触发validate方法，但会发现，我们平时会在el-input上加@validate吗？肯定不会这么写！所以这里会用个巧妙的方式，让它老爹去emit(老爹万一不是form-item怎么办，到时候看源码分析-实现了dispatch，这里我们先简易实现)

sf-input里实现

```js
    onInput (e) {
      this.$emit('input', e.target.value)
      // 没有这样使用过，因为在el-input上没写过@validate
      //   this.$emit('validate')
      // $parent在目前的结构，就是form-item
      this.$parent.$emit('validate')
    }
```

input已经emit通知了form-item， form-item要用`$on`方法监听

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
```

![06-trigger-validate](./表单组件实现截图/06-trigger-validate.gif)

这样input如何通知form-item去校验就完成了

### 校验功能-祖孙通信

那接下去就是如何拿到校验规则，form上有model和rules属性，怎么给到form-item呢，使用祖孙间通讯处理！

sf-form实现如下

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  }
}
</script>

<style>

</style>

```

写完后不要忘记在playground，传入model和rules！playground具体代码如下

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules">
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  }
}
</script>

<style>
</style>

```

sf-form-item需要inject拿到数据，并且可以在validate方法打印下数据，也可以在模板里直接双大扩号看看，调试后记得把模板里的调试代码删除哈，代码如下

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model }}</h1>
    <h1>rules {{ form.rules }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model, this.form.rules)
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

![07-model-and-rules](./表单组件实现截图/07-model-and-rules.jpg)

所以我们该怎么处理只关注的字段呢，请看下个知识点的讲解！

### form-item的prop属性

前面打印出来的rules是个对象，对象里可能有username，password属性，但form-item只需要校验自己的那一个规则，那该怎么获取到自己的那个规则呢

所以我们要传入prop，prop不是个必填属性，只有当你要校验的时候才需要传入该属性

换一句话说，我们表单四要素，前面`v-model`，`model`，`rules`都有了，要校验的话还差的就是prop

playground小伙伴就自行添加prop属性

FormItem组件里这样实现

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model[prop] }}</h1>
    <h1>rules {{ form.rules[prop] }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model[this.prop], this.form.rules[this.prop])
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>
  
```

![08-form-item-prop](./表单组件实现截图/08-form-item-prop.jpg)

完美拿到对应表单项的数据以及校验规则，接下去使用个第三方库，参考文档直接撸就完事了！

### 校验的库-async-validator

- 安装依赖
- 校验逻辑处理
  - 获取字段的规则们和值
  - 获得校验器实例并调用校验方法
  - 设置data选项中error字段(有错误设置errors数组第一项，没错误就清空)

其实代码都是参考[async-validator文档](https://www.npmjs.com/package/async-validator)，最终实现效果代码如下

```js
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
```

![09-async-validator](./表单组件实现截图/09-async-validator.gif)

到这里，单个表单项校验就已经搞定了，离我们任务还差最后一个！

### form实例上提供校验所有字段方法

form组件上绑定ref属性，用于获取实例

提供button，也用form-item包裹下！点击按钮后要所有字段通过校验后才能触发业务逻辑

先实现其中一个用法那就是回调函数，参数里有个valid字段

当valid字段为true，代表校验通过，反之，校验失败！

```js
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
```

form组件实现validate方法

```js
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
```

![10-form-validate.gif](./表单组件实现截图/10-form-validate.gif)

完结撒花，恭喜大家，这次的案例，麻雀虽小五脏俱全！接下去简单扩展下源码

## 简易版实现完整代码

### SfInput

```vue
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
      this.$parent.$emit('validate')
    }
  }
}
</script>

<style>

</style>

```

### SfFormItem

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <!-- <h1>model {{ form.model[prop] }}</h1> -->
    <!-- <h1>rules {{ form.rules[prop] }}</h1> -->
</div>
</template>

<script>
import Schema from 'async-validator'
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      return validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

### SfForm

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  },
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
}
</script>

<style>

</style>

```

### Playground使用这些组件

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules" ref="form">
      <sf-form-item label="用户名" prop="username">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码" prop="password">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
      <sf-form-item>
        <button @click="onLogin">login</button>
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  },
  methods: {
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
  }
}
</script>

<style>
</style>

```

## form源码分析（可选）

前面说结构高耦合问题如何解决，先看`src/mixins/emitters.js`

- broadcast 广播方法 - 自上而下
- dispatch 派发 - 自下而上

再看`src/packages`

- input组件 - watch监听value的变化
- form-item组件 - 挂载生命周期函数 - addField告诉form要校验什么字段
- form组件 - form这边fields数组收集了要校验的字段

## 总结

- 更多组件通讯方式get！以后别说只会父子通讯，还有祖孙级别（provide/inject），以及属性和事件透传($attrs/$listeners)
- 校验四要素的原理实现get！知道为什么要传prop了吧
- async-validator的使用技能get！element就是用这个校验的，跟着文档写美滋滋
- 查看分析表单组件源码技能get！学习源码，头秃了，但变强了！
hello，大家好，我是梅利奥猪猪（帅峰）！是一位持续进步喜欢分享知识的讲师！好久没更新博客了，这次一如既往的带给大家干货，一起手写简易版`element-ui`的组件之表单组件`el-form`，`el-form-item`，`el-input`！通过这篇文章的学习，大家肯定能变得更强，让我们开始吧！

注意了，本次实现是`element-ui`，非plus，所以用的是vue2！

## 需求分析

那在做之前肯定要先分析下大家熟练掌握的表单组件，是如何用的，简易版主要实现以下几点即可

- sf-form

  - 载体，输入数据model，校验规则rules
  - form实例上有校验validate函数

- sf-item

  - label标签添加
  - 载体，输入项包装
  - 校验执行者，显示错误

- sf-input

  - 双绑
  - 触发校验

是不是很熟悉，掌握手写他们后，我们能更进一步深入了解，之前的表单校验四要素，为什么要写他们！接着我们从最里面那层`input`组件开始写起！

## sf-input

### 双绑

众所周知，我们使用个`input`组件，就会这么使用，代码如下

`<sf-input v-model="form.username"></sf-input>`

本质就是实现`:value`和`@input`

SfInput.vue实现如下

```jsx
<template>
  <div>
    <input :value="value" @input="onInput">
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

在playground使用SfInput组件

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username"></sf-input>
    {{ form.username }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![01-input-v-model.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4d8774b78ca46bd994bfc65d5895533~tplv-k3u1fbpfcp-watermark.image?)

这样一个最简单的双向数据绑定就完成了

### placeholder处理

在学这个知识之前，不知道大家知不知道vue2里的`$attrs`和`$listeners`，不知道可以自己补课下哈！我们会用到`$attrs`这个知识

使用上，我们肯定希望在组件上直接加上placeholder，就可以使用了，代码如下
`<sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>`

但加好`placeholder`这个属性之后以后发现了个问题！

![02-root-attr.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/772faecb7ae04b11ae8cd4fb47bee5ac~tplv-k3u1fbpfcp-watermark.image?)

原因是因为，我们在组件上写的属性，组件默认会继承，在组件的根元素加上这个属性，那该怎么办呢，只要在组件内加上选项`inheritAttrs: false`，根元素上就不会继承这个属性了！

但最后我们的目的是把placeholder加到哪里？加载input元素上！以往我们可能就会使用父传子了，但这里可以使用`$attrs`，请看官方文档的这段解释

> 包含了父作用域中不作为 prop 被识别 (且获取) 的 attribute 绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="\$attrs" 传入内部组件——在创建高级别的组件时非常有用。

SfInput的实现如下

```vue
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

![03-$attrs.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2d52c0a71114b108207775835bcf629~tplv-k3u1fbpfcp-watermark.image?)

完美轻松搞定，那如果此时在写个密码的input框，`type="password"`，小伙伴们你们说会怎么样？属性依然可以透传，效果还是杠杠的

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
    {{ form.username }}
    <sf-input type="password" v-model="form.password" placeholder="请输入密码"></sf-input>
    {{ form.password }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![04-$attrs-power.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bc84683b089436292be04f1d1ad7656~tplv-k3u1fbpfcp-watermark.image?)

好，那我们的`input`组件就先写到这里

## sf-form-item

前面实现了`input`，接下去我们要来实现包在他外面那一层的`form-item`

### 搭架子

先思考下我们是怎么用

```vue
<sf-form-item label='用户名'>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
</sf-form-item>
```

如果传了`label`会显示`label`，如果没传就不显示！还有就是`input`组件怎么渲染出来，不就是默认插槽吗！

所以接下去就简单实现下这个效果

```vue
<template>
<div>
    <!-- 判断label有没有 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>

</style>

```

接着在playground就这么用

```jsx
<sf-form-item label="用户名">
  <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
  {{ form.username }}
</sf-form-item>
<sf-form-item label="密码">
  <sf-input
    type="password"
    v-model="form.password"
    placeholder="请输入密码"
  ></sf-input>
  {{ form.password }}
</sf-form-item>
```

![05-form-item-label.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f2f411c980c499fbc93c12a3c992e30~tplv-k3u1fbpfcp-watermark.image?)

label就完美处理好了！

### 错误信息

接下去我们考虑下之前校验失败在输入框下面有报错信息，这个报错信息怎么来的？应该是我们`rules`里配置了`message`信息对吧，然后校验没通过就显示！但不管怎么样，`error`的数据不是我们直接传给`form-item`组件的，他不是对外暴露的，即不是用户传`error`进来的，而是组件自己的状态

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  }
}
</script>

<style>

</style>

```

至于校验的实现，等我们完整的架子搞定了在去处理

## sf-form

### 结构

我们之后希望是这么使用的

```jsx
    <sf-form>
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
      </sf-form-item>
    </sf-form>
```

他就是个简单的容器，直接提供插槽即可

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>

```

试下功能依然没问题可以运行，`form`组件的架子其实就这么简单！我们在后面再处理父传子`model`和`rules`，以及难点，实现一个整体表单校验的`validate`函数

## 校验处理

### 思考问题

校验什么时候触发？input表单框输入内容变化了就触发（简易版就input事件触发，就校验）

如何校验？input组件直接在自己这里`emit('validate')`吗？我们好像没有在input组件上写过`@validate`吧

源码中是每个form-item实现了validate函数，就是对其每一项表单项输入做校验。那input如何去通知form-item去调用validate函数呢

### 初步搭架子

经过前面的分析，所以我们接下去要在form-item里要提供validate方法

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
```

在input的onInput方法里emit触发validate方法，但会发现，我们平时会在el-input上加@validate吗？肯定不会这么写！所以这里会用个巧妙的方式，让它老爹去emit(老爹万一不是form-item怎么办，到时候看源码分析-实现了dispatch，这里我们先简易实现)

sf-input里实现

```js
    onInput (e) {
      this.$emit('input', e.target.value)
      // 没有这样使用过，因为在el-input上没写过@validate
      //   this.$emit('validate')
      // $parent在目前的结构，就是form-item
      this.$parent.$emit('validate')
    }
```

input已经emit通知了form-item， form-item要用`$on`方法监听

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
```

![06-trigger-validate.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5492d2120a841f79fad48688801520a~tplv-k3u1fbpfcp-watermark.image?)

这样input如何通知form-item去校验就完成了

### 校验功能-祖孙通信

那接下去就是如何拿到校验规则，form上有model和rules属性，怎么给到form-item呢，使用祖孙间通讯处理！

sf-form实现如下

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  }
}
</script>

<style>

</style>

```

写完后不要忘记在playground，传入model和rules！playground具体代码如下

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules">
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  }
}
</script>

<style>
</style>

```

sf-form-item需要inject拿到数据，并且可以在validate方法打印下数据，也可以在模板里直接双大扩号看看，调试后记得把模板里的调试代码删除哈，代码如下

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model }}</h1>
    <h1>rules {{ form.rules }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model, this.form.rules)
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

![07-model-and-rules.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33d3add4eff04d4e8c4cb2015c64d630~tplv-k3u1fbpfcp-watermark.image?)

所以我们该怎么处理只关注的字段呢，请看下个知识点的讲解！

### form-item的prop属性

前面打印出来的rules是个对象，对象里可能有username，password属性，但form-item只需要校验自己的那一个规则，那该怎么获取到自己的那个规则呢

所以我们要传入prop，prop不是个必填属性，只有当你要校验的时候才需要传入该属性

换一句话说，我们表单四要素，前面`v-model`，`model`，`rules`都有了，要校验的话还差的就是prop

playground小伙伴就自行添加prop属性

FormItem组件里这样实现

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model[prop] }}</h1>
    <h1>rules {{ form.rules[prop] }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model[this.prop], this.form.rules[this.prop])
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>
  
```

![08-form-item-prop.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7731fa79203481a8826f54ef131154e~tplv-k3u1fbpfcp-watermark.image?)

完美拿到对应表单项的数据以及校验规则，接下去使用个第三方库，参考文档直接撸就完事了！

### 校验的库-async-validator

- 安装依赖
- 校验逻辑处理
  - 获取字段的规则们和值
  - 获得校验器实例并调用校验方法
  - 设置data选项中error字段(有错误设置errors数组第一项，没错误就清空)

其实代码都是参考[async-validator文档](https://www.npmjs.com/package/async-validator)，最终实现效果代码如下

```js
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
```

![09-async-validator.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbe83e24d7364a649554c2af45f7b7be~tplv-k3u1fbpfcp-watermark.image?)

到这里，单个表单项校验就已经搞定了，离我们任务还差最后一个！

### form实例上提供校验所有字段方法

form组件上绑定ref属性，用于获取实例

提供button，也用form-item包裹下！点击按钮后要所有字段通过校验后才能触发业务逻辑

先实现其中一个用法那就是回调函数，参数里有个valid字段

当valid字段为true，代表校验通过，反之，校验失败！

```js
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
```

form组件实现validate方法

```js
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
```

![10-form-validate.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f9d154a46c0444f87db647c1dd6a506~tplv-k3u1fbpfcp-watermark.image?)

完结撒花，恭喜大家，这次的案例，麻雀虽小五脏俱全！但我们学到的东西还是不少的，下面完整实现的代码大家拿去！

## 简易版实现完整代码

### SfInput

```vue
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
      this.$parent.$emit('validate')
    }
  }
}
</script>

<style>

</style>

```

### SfFormItem

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <!-- <h1>model {{ form.model[prop] }}</h1> -->
    <!-- <h1>rules {{ form.rules[prop] }}</h1> -->
</div>
</template>

<script>
import Schema from 'async-validator'
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      return validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

### SfForm

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  },
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
}
</script>

<style>

</style>

```

### Playground使用这些组件

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules" ref="form">
      <sf-form-item label="用户名" prop="username">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码" prop="password">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
      <sf-form-item>
        <button @click="onLogin">login</button>
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  },
  methods: {
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
  }
}
</script>

<style>
</style>

```

## form源码分析（可选）

前面说结构高耦合问题如何解决，先看`src/mixins/emitters.js`

- broadcast 广播方法 - 自上而下
- dispatch 派发 - 自下而上

再看`src/packages`

- input组件 - watch监听value的变化
- form-item组件 - 挂载生命周期函数 - addField告诉form要校验什么字段
- form组件 - form这边fields数组收集了要校验的字段

## 总结

- **更多组件通讯方式get**！以后别说只会父子通讯，还有祖孙级别（provide/inject），以及属性和事件透传(attrs/listeners)
- **校验四要素的原理实现get**！知道为什么要传prop了吧
- **async-validator的使用技能get**！element就是用这个校验的，跟着文档写美滋滋
- **查看分析表单组件源码技能get**！学习源码，头秃了，但变强了！
hello，大家好，我是梅利奥猪猪（帅峰）！是一位持续进步喜欢分享知识的讲师！好久没更新博客了，这次一如既往的带给大家干货，一起手写简易版`element-ui`的组件之表单组件`el-form`，`el-form-item`，`el-input`！通过这篇文章的学习，大家肯定能变得更强，让我们开始吧！

注意了，本次实现是`element-ui`，非plus，所以用的是vue2！

## 能学到什么

- 组件间更多的通讯方式
- 校验四要素原理实现
- async-validator的使用
- 查看源码学习

## 需求分析

那在做之前肯定要先分析下大家熟练掌握的表单组件，是如何用的，简易版主要实现以下几点即可

- sf-form

  - 载体，输入数据model，校验规则rules
  - form实例上有校验validate函数

- sf-item

  - label标签添加
  - 载体，输入项包装
  - 校验执行者，显示错误

- sf-input

  - 双绑
  - 触发校验

是不是很熟悉，掌握手写他们后，我们能更进一步深入了解封装的一些思想！接着我们从最里面那层`input`组件开始写起！

## sf-input

### 双绑

众所周知，我们使用个`input`组件，就会这么使用，代码如下

`<sf-input v-model="form.username"></sf-input>`

本质就是实现`:value`和`@input`

SfInput.vue实现如下

```jsx
<template>
  <div>
    <input :value="value" @input="onInput">
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

在playground使用SfInput组件

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username"></sf-input>
    {{ form.username }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![01-input-v-model.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4d8774b78ca46bd994bfc65d5895533~tplv-k3u1fbpfcp-watermark.image?)

这样一个最简单的双向数据绑定就完成了

### placeholder处理

在学这个知识之前，不知道大家知不知道vue2里的`$attrs`和`$listeners`，我们待会儿会用到`$attrs`这个知识

使用上，我们肯定希望在组件上直接加上placeholder，就可以使用了，代码如下

`<sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>`

但加好`placeholder`这个属性之后以后发现了个问题！

![02-root-attr.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/772faecb7ae04b11ae8cd4fb47bee5ac~tplv-k3u1fbpfcp-watermark.image?)

原因是因为，我们在组件上写的属性，组件默认会继承，在组件的根元素加上这个属性，那该怎么办呢，只要在组件内加上选项`inheritAttrs: false`，根元素上就不会继承这个属性了！

但最后我们的目的是把placeholder加到哪里？加在input元素上！以往我们可能就会使用父传子了，但这里可以使用`$attrs`，请看官方文档的这段解释

> 包含了父作用域中不作为 prop 被识别 (且获取) 的 attribute 绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="\$attrs" 传入内部组件——在创建高级别的组件时非常有用。

SfInput的实现如下

```vue
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style>

</style>

```

![03-$attrs.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2d52c0a71114b108207775835bcf629~tplv-k3u1fbpfcp-watermark.image?)

完美轻松搞定，那如果此时在写个密码的input框，`type="password"`，小伙伴们你们说会怎么样？属性依然可以透传，效果还是杠杠的

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
    {{ form.username }}
    <sf-input type="password" v-model="form.password" placeholder="请输入密码"></sf-input>
    {{ form.password }}
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
export default {
  components: { SfInput },
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style>
</style>

```

![04-$attrs-power.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bc84683b089436292be04f1d1ad7656~tplv-k3u1fbpfcp-watermark.image?)

好，那我们的`input`组件就先写到这里

## sf-form-item

前面实现了`input`，接下去我们要来实现包在他外面那一层的`form-item`吧

### 搭架子

先思考下我们是怎么用的

```jsx
<sf-form-item label='用户名'>
    <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
</sf-form-item>
```

如果传了`label`会显示`label`，如果没传就不显示！还有就是`input`组件怎么渲染出来，不就是默认插槽吗！

所以接下去就简单实现下这个效果

```vue
<template>
<div>
    <!-- 判断label有没有 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>

</style>

```

接着在playground就这么用

```jsx
<sf-form-item label="用户名">
  <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
  {{ form.username }}
</sf-form-item>
<sf-form-item label="密码">
  <sf-input
    type="password"
    v-model="form.password"
    placeholder="请输入密码"
  ></sf-input>
  {{ form.password }}
</sf-form-item>
```

![05-form-item-label.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f2f411c980c499fbc93c12a3c992e30~tplv-k3u1fbpfcp-watermark.image?)

label就完美处理好了！

### 错误信息

接下去我们考虑下之前校验失败在输入框下面有报错信息，这个报错信息怎么来的？应该是我们`rules`里配置了`message`信息对吧，然后校验没通过就显示！但不管怎么样，`error`的数据不是我们直接传给`form-item`组件的，他不对外暴露，即不是用户传`error`进来的，而是组件自己的状态

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  }
}
</script>

<style>

</style>

```

至于校验的实现，等我们完整的架子搞定了在去处理

## sf-form

### 结构

我们之后希望是这么使用的

```jsx
    <sf-form>
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
      </sf-form-item>
    </sf-form>
```

他就是个简单的容器，直接提供插槽即可

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>

```

试下功能依然没问题，`form`组件的架子其实就这么简单！我们之后再处理父传子`model`和`rules`！以及校验的难点，实现一个整体表单校验的`validate`函数

## 校验处理

### 思考问题

校验什么时候触发？input表单框输入内容变化了就触发（简易版就input事件触发然后校验）

那如何校验呢？input组件直接在自己这里`emit('validate')`吗？我们好像没有在input组件上写过`@validate`吧

源码中的思想，是每个form-item实现了validate函数，就是对他们自己的表单项做校验。那input如何去通知form-item去调用validate函数呢

### 初步搭架子

经过前面的分析，我们接下去要在form-item里要提供validate方法

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
```

在input的onInput方法里emit触发validate方法，我们平时会在el-input上加@validate吗？肯定不会这么写！所以这里会用个巧妙的方式，让它老爹去emit(老爹万一不是form-item怎么办，到时候看源码分析-源码实现了dispatch方法，这里我们先简易实现)

sf-input里实现

```js
    onInput (e) {
      this.$emit('input', e.target.value)
      // 没有这样使用过，因为在el-input上没写过@validate
      //   this.$emit('validate')
      // $parent在目前的结构，就是form-item
      this.$parent.$emit('validate')
    }
```

input已经emit通知了form-item， form-item要用`$on`方法监听

```js
  methods: {
    validate () {
      console.log('validate')
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
```

![06-trigger-validate.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5492d2120a841f79fad48688801520a~tplv-k3u1fbpfcp-watermark.image?)

这样input如何通知form-item去校验就完成了

### 校验功能-祖孙通信

那之后就是如何拿到校验规则，form上有model和rules属性，怎么给到form-item呢，使用祖孙间通讯处理！

sf-form实现如下

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  }
}
</script>

<style>

</style>

```

写完后不要忘记在playground，传入model和rules！playground具体代码如下

```vue
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules">
      <sf-form-item label="用户名">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  }
}
</script>

<style>
</style>

```

sf-form-item需要inject拿到数据，并且可以在validate方法打印下数据，也可以在模板里直接双大扩号看看，代码如下

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model }}</h1>
    <h1>rules {{ form.rules }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model, this.form.rules)
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

![07-model-and-rules.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33d3add4eff04d4e8c4cb2015c64d630~tplv-k3u1fbpfcp-watermark.image?)

所以我们该怎么处理只关注的字段呢，请看下个知识点的讲解！

### form-item的prop属性

前面打印出来的rules是个对象，对象里可能有username，password属性，但form-item只需要校验自己的那一个规则，那该怎么获取到自己的那个规则呢

所以我们要传入prop，prop不是个必填属性，只有当你要校验的时候才需要传入该属性

换一句话说，我们表单四要素，前面`v-model`，`model`，`rules`都有了，要校验的话还差的就是prop

playground小伙伴就自行添加prop属性

FormItem组件里这样实现

```vue
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <h1>model {{ form.model[prop] }}</h1>
    <h1>rules {{ form.rules[prop] }}</h1>
</div>
</template>

<script>
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      console.log('validate', this.form.model[this.prop], this.form.rules[this.prop])
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>
  
```

![08-form-item-prop.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7731fa79203481a8826f54ef131154e~tplv-k3u1fbpfcp-watermark.image?)

完美拿到对应表单项的数据以及校验规则，接下去使用个第三方库，参考文档直接撸就完事了！

### 校验的库-async-validator

- 安装依赖
- 校验逻辑处理
  - 获取字段的规则们和值
  - 获得校验器实例并调用校验方法
  - 设置data选项中error字段(有错误设置errors数组第一项，没错误就清空)

其实代码都是参考[async-validator文档](https://www.npmjs.com/package/async-validator)，最终实现效果代码如下

```js
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
```

![09-async-validator.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbe83e24d7364a649554c2af45f7b7be~tplv-k3u1fbpfcp-watermark.image?)

到这里，单个表单项校验就已经搞定了，离我们任务还差最后一个！

### form实例上提供校验所有字段方法

form组件上绑定ref属性，用于获取实例

提供button，也用form-item包裹下！点击按钮后要所有字段通过校验后才能触发业务逻辑

先实现其中一个用法那就是回调函数，参数里有个valid字段

当valid字段为true，代表校验通过，反之，校验失败！

```js
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
```

form组件实现validate方法

```js
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
```

![10-form-validate.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f9d154a46c0444f87db647c1dd6a506~tplv-k3u1fbpfcp-watermark.image?)

完结撒花，恭喜大家，这次的案例，麻雀虽小五脏俱全！但我们学到的东西还是不少的，下面完整实现的代码大家拿去！

## 简易版实现完整代码

### SfInput

```jsx
<template>
  <div>
    <input :value="value" @input="onInput" v-bind="$attrs">
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
      this.$parent.$emit('validate')
    }
  }
}
</script>

<style>

</style>

```

### SfFormItem

```jsx
<template>
<div>
    <!-- label 有label才渲染 -->
    <label v-if="label">{{label}}</label>
    <!-- 插槽 -->
    <slot></slot>
    <!-- 错误信息 有error才显示-->
    <p v-if="error">{{error}}</p>
    <!-- <h1>model {{ form.model[prop] }}</h1> -->
    <!-- <h1>rules {{ form.rules[prop] }}</h1> -->
</div>
</template>

<script>
import Schema from 'async-validator'
export default {
  inject: ['form'],
  props: {
    label: {
      type: String,
      default: ''
    },
    prop: {
      type: String
    }
  },
  data () {
    return {
      error: ''
    }
  },
  methods: {
    validate () {
      // 1.获取字段规则和值
      const rules = this.form.rules[this.prop]
      const value = this.form.model[this.prop]
      // 2. 获取实例 并调用校验方法
      const validator = new Schema({
        [this.prop]: rules
      })
      return validator.validate({ [this.prop]: value }, (errors, fields) => {
        if (errors) {
          // 3.1 赋值错误信息
          this.error = errors[0].message
        } else {
          // 3.2 没错误清空错误信息
          this.error = ''
        }
      })
    }
  },
  mounted () {
    this.$on('validate', () => {
      this.validate()
    })
  }
}
</script>

<style>

</style>

```

### SfForm

```jsx
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true
    },
    rules: Object
  },
  provide () {
    return {
      form: this
    }
  },
  methods: {
    // 回调函数cb在校验全部执行完后再执行
    validate (cb) {
      // validate函数返回的是promise(因为可能是异步的)，所以用map返回的是个promise数组
      // 注意要记得在form-item的validate方法里，要return validator.validate执行方法的结果，这样拿到的结果才是promise
      // $children不够健壮，和之前$parents一样的问题，对结构要求高
      // 不是所有孩子都要校验，应该是有prop的才要校验
      const promises = this.$children.filter(item => item.prop).map(item => item.validate())
      // eslint-disable-next-line
      Promise.all(promises).then(() => cb(true)).catch(() => cb(false))
    }
  }
}
</script>

<style>

</style>

```

### Playground使用这些组件

```jsx
<template>
  <div>
    <h1>Playground</h1>
    <sf-form :model="form" :rules="rules" ref="form">
      <sf-form-item label="用户名" prop="username">
        <sf-input v-model="form.username" placeholder="请输入用户名"></sf-input>
        {{ form.username }}
      </sf-form-item>
      <sf-form-item label="密码" prop="password">
        <sf-input
          type="password"
          v-model="form.password"
          placeholder="请输入密码"
        ></sf-input>
        {{ form.password }}
      </sf-form-item>
      <sf-form-item>
        <button @click="onLogin">login</button>
      </sf-form-item>
    </sf-form>
  </div>
</template>

<script>
import SfInput from '../components/SfInput.vue'
import SfFormItem from '../components/SfFormItem.vue'
import SfForm from '../components/SfForm.vue'
export default {
  components: { SfInput, SfFormItem, SfForm },
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, message: '请输入密码' }
        ]
      }
    }
  },
  methods: {
    onLogin () {
      // console.log('login')
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('校验通过')
        } else {
          console.log('校验失败')
        }
      })
    }
  }
}
</script>

<style>
</style>

```

## form源码分析（可选）

前面说结构高耦合问题如何解决，先看`src/mixins/emitters.js`

- broadcast 广播方法 - 自上而下
- dispatch 派发 - 自下而上

再看`src/packages`

- input组件 - watch监听value的变化
- form-item组件 - 挂载生命周期函数 - addField告诉form要校验什么字段
- form组件 - form这边fields数组收集了要校验的字段

## 总结

- **更多组件通讯方式get**！以后别说只会父子通讯，还有祖孙级别（provide/inject），以及属性和事件透传(attrs/listeners)
- **校验四要素的原理实现get**！知道为什么要传prop了，要获取对应字段的数据及规则
- **async-validator的使用技能get**！element就是用这个校验的，跟着文档写美滋滋
- **查看分析表单组件源码技能get**！学习源码，头秃了，但变强了！
