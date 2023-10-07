# vue3源码解读

## vue3初体验

- 支持选项式的写法
  - 声明data选项和setup选项，都返回了数据，哪个优先级高？

```html
<!DOCTYPE html>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue3</title>
</head>

<body>
    <div id="app">
        <h1>{{title}}</h1>
    </div>
    <script src="http://unpkg.com/vue@next"></script>
    <script>
        // console.log(Vue);
        const { createApp } = Vue
        const app = createApp({
            data() {
                return {
                    title: 'data title'
                }
            },
            setup () {
                return {
                    title: 'setup title',
                }
            }
        })
        app.mount('#app')

    </script>
</body>

</html>
```
  
## vue3设计理念

- 动机
  - 函数式
    - 类型支持更好，消除this
  - 利于tree shaking
    - vue2静态方法`Vue.use`,vue3实例方法`app.use()`且支持链式调用
    - vue2静态方法use了插件，但如果最后没有使用，也会被打包进去
    - 实例方法更容易追踪
  - 简化
    - v-model
    - render
    - 指令
  - 复用性 composition api  
    - mixin 冲突，来源不明
  - 性能优化
    - 响应式
    - 编译
  - 扩展性
    - 自定义渲染器 customRenderer  

## 手写实现初始化流程

### 基本结构

- createApp
- mount

### 挂载

- mount

### 编译

- compile

### 兼容options

- setup

### 扩展性

- createRenderer

## 调试环境准备

- 克隆项目
- 切换分支`git checkout -b vue3-study-xxx`
- 安装依赖`pnpm i`
- 生成sourcemap文件`"dev": "node scripts/dev.js --sourcemap"`
- 看`packages/vue/examples/classic/todomvc.html`

## 初始化流程分析

- vue
  - runtime-dom
    - runtime-core
  - compile-dom
    - compile-core
  - reactive

- ensureRenderer
  - createRenderer
    - renderer

- createApp
  - renderer.createApp
    - app

## 自定义渲染器实战

## composition-api初体验

## vue3响应式源码学习

## 响应式原理vue2 vs vue3

## 造轮子之旅-手写源码

## 编译器原理

## vue3编译过程剖析

## vue3编译优化策略

### 静态节点提升

### 补丁标记和动态属性记录

### 缓存事件处理程序

### 块 block

## vue3异步更新策略

## vue3 patch算法剖析
